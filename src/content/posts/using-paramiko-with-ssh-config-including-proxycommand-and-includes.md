---
pubDatetime: 2025-11-26T16:05:53+00:00
title: "Using Paramiko with SSH Config Including ProxyCommand and Includes"
tags:
  - "Linux"
  - "Networking"
  - "Python"
  - "Ssh"
heroImage: "/blog-media/2021/01/python.png"
description: "This guide documents how to properly use Paramiko with SSH configurations that include: SSH config include directives ProxyCommand for AWS SSM Session Manager Multiple configuration parameters (hostname, user, identity files, etc.) The Problem Paramiko's SSHConfig.parse() has two key limitations: Does not support include directives - If your ~/.ssh/config has lines like include ./config.d/*.conf, paramiko will…"
---
This guide documents how to properly use Paramiko with SSH configurations that include:

- SSH config `include` directives
- ProxyCommand for AWS SSM Session Manager
- Multiple configuration parameters (hostname, user, identity files, etc.)

## The Problem

Paramiko’s `SSHConfig.parse()` has two key limitations:

1.  **Does not support** `include` **directives** – If your `~/.ssh/config` has lines like `include ./config.d/*.conf`, paramiko will ignore them
2.  **ProxyCommand requires special handling** – The socket needs to be created and passed to the connection

## The Solution

### 1. Handle Include Directives Manually

Create a function to parse included config files before letting paramiko parse the main config:

```
def load_ssh_config_with_includes(config_path):
    """Load SSH config and handle include directives manually since paramiko doesn't support them well."""
    import glob

    ssh_config = paramiko.SSHConfig()
    config_dir = os.path.dirname(config_path)

    with open(config_path) as f:
        for line in f:
            line = line.strip()
            # Check for include directive
            if line.lower().startswith('include '):
                include_pattern = line.split(None, 1)[1]
                # Expand relative paths
                if not os.path.isabs(include_pattern):
                    include_pattern = os.path.join(config_dir, include_pattern)

                # Find all matching files
                include_files = glob.glob(os.path.expanduser(include_pattern))
                print(f"Found {len(include_files)} included config files: {include_files}")

                # Parse each included file
                for include_file in sorted(include_files):
                    print(f"  Loading included config: {include_file}")
                    with open(include_file) as inc_f:
                        ssh_config.parse(inc_f)
            else:
                # For non-include lines, we need to rewind and let paramiko parse the whole file
                # We'll handle this by parsing the main file last
                pass

    # Now parse the main config file (this will get non-include directives)
    with open(config_path) as f:
        ssh_config.parse(f)

    return ssh_config

# Load the config
ssh_config = load_ssh_config_with_includes(os.path.expanduser("~/.ssh/config"))
```

### 2. Create SSH Connection with ProxyCommand Support

The connection function needs to:

- Extract all SSH config parameters (hostname, user, identity file, etc.)
- Handle ProxyCommand by creating a socket
- Replace `%h` and `%p` placeholders in ProxyCommand
- Pass the socket to the connection

```
def get_ssh_client(host):
    """Initializes and configures the paramiko SSH client using SSH config, handling ProxyCommand."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())  # noqa: S507

    # Lookup host configuration
    host_config = ssh_config.lookup(host)

    # Extract parameters from config
    resolved_hostname = host_config.get('hostname', host)
    port = int(host_config.get('port', 22))
    ssh_user = host_config.get('user', os.environ.get('USER'))
    key_filename = host_config.get('identityfile')

    # Expand home directory in key path
    if key_filename:
        key_filename = os.path.expanduser(key_filename[0])

    # Check for forward agent setting
    allow_agent = host_config.get('forwardagent', 'no').lower() == 'yes'

    # Handle ProxyCommand if present
    proxy_command_str = host_config.get('proxycommand')
    sock = None

    if proxy_command_str:
        if not resolved_hostname:
            print(f"ERROR: Cannot resolve hostname for {host}")
            return None

        # Replace %h and %p placeholders
        proxy_command_str = proxy_command_str.replace('%h', resolved_hostname).replace('%p', str(port))

        print(f"ProxyCommand detected. Executing: {proxy_command_str}")

        try:
            # Create ProxyCommand socket
            sock = paramiko.ProxyCommand(proxy_command_str)
        except Exception as e:
            print(f"ERROR: Failed to set up ProxyCommand: {e}")
            return None

    # Type guard for hostname
    if not resolved_hostname:
        print(f"ERROR: Cannot resolve hostname for {host}")
        return None

    # Establish connection
    try:
        print(f"Connecting to {host}. Resolved Hostname: {resolved_hostname}:{port}. Connection User: {ssh_user}")
        client.connect(
            hostname=resolved_hostname,
            port=port,
            username=ssh_user,
            key_filename=key_filename,
            allow_agent=allow_agent,
            sock=sock,  # Critical: Pass the ProxyCommand socket
            timeout=10
        )
        return client
    except Exception as e:
        print(f"ERROR: Could not connect to {host}. Details: {e}")
        return None
```

## Example SSH Config

This solution works with configurations like:

**~/.ssh/config:**

`include ./config.d/*.conf`

**~/.ssh/config.d/aws.conf:**

```
Host production-pg-0
  User ubuntu
  Hostname i-03a18dc32c2e9445c
  IdentityFile /home/myuser/.ssh/mykey
  IdentitiesOnly yes
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
  StrictHostKeyChecking=no
  UserKnownHostsFile=/dev/null
```

## Key Points

### Critical Parameters

1.  **hostname** – The actual server to connect to (can be instance ID for SSM)
2.  **user** – The SSH user from config (don’t hardcode or fall back to environment user only)
3.  **sock** – The ProxyCommand socket must be passed to `client.connect()`
4.  **key_filename** – Must expand `~` with `os.path.expanduser()`

### ProxyCommand Placeholder Replacement

Always replace these placeholders before creating the socket:

- `%h` → resolved hostname
- `%p` → port number

### Common Mistakes to Avoid

1.  ❌ Not handling `include` directives
2.  ❌ Not passing the `sock` parameter to `client.connect()`
3.  ❌ Forgetting to replace `%h` and `%p` in ProxyCommand
4.  ❌ Not expanding `~` in identity file paths
5.  ❌ Using hardcoded username instead of reading from config

## Testing

Test your connection with:

```
client = get_ssh_client('production-pg-0')
if client:
    stdin, stdout, stderr = client.exec_command('hostname')
    print(stdout.read().decode())
    client.close()
```

## Reusable Module

The SSH client functionality has been extracted into a reusable module: `ssh_client.py`

This module provides:

- `SSHConfigLoader`: Handles loading SSH configs with include directive support
- `SSHClientFactory`: Creates SSH clients with full config support including ProxyCommand
- Custom exceptions: `SSHConfigError` and `SSHConnectionError`
- Comprehensive logging support

### Using the Module

```
from ssh_client import SSHConfigLoader, SSHClientFactory

# Load SSH config
ssh_config = SSHConfigLoader.load_config("~/.ssh/config")

# Create SSH client
client = SSHClientFactory.create_client(ssh_config, "my-host", timeout=10)

if client:
    stdin, stdout, stderr = client.exec_command("hostname")
    print(stdout.read().decode())
    client.close()
```

### Module Benefits

- Type-safe with proper type hints
- Comprehensive error handling
- Logging support for debugging
- Unit tested (see `test_ssh_client.py`)
- Follows coding standards and best practices

## Module Code

```
"""SSH Client module with SSH config support including ProxyCommand and includes.

This module provides utilities for connecting to SSH hosts using paramiko with full
support for OpenSSH configuration files, including:
- SSH config include directives
- ProxyCommand (e.g., AWS SSM Session Manager)
- All standard SSH config parameters

Example:
    >>> config = SSHConfigLoader.load_config("~/.ssh/config")
    >>> client = SSHClientFactory.create_client(config, "my-host")
    >>> if client:
    ...     stdin, stdout, stderr = client.exec_command("hostname")
    ...     print(stdout.read().decode())
    ...     client.close()

Exports:
    - SSHClient: Type alias for paramiko.SSHClient (for type hints in other modules)
    - SSHConfig: Type alias for paramiko.SSHConfig (for type hints in other modules)
    - SSHConfigLoader: Class for loading SSH configurations
    - SSHClientFactory: Class for creating SSH clients
    - SSHConfigError: Exception for SSH config errors
    - SSHConnectionError: Exception for SSH connection errors
"""

import glob
import logging
import os
from typing import TypedDict, cast

import paramiko

# Constants
DEFAULT_SSH_PORT = 22
DEFAULT_CONNECTION_TIMEOUT = 10
SSH_CONFIG_DEFAULT_PATH = "~/.ssh/config"

logger = logging.getLogger(__name__)

# Type aliases for external use (allows other modules to avoid importing paramiko directly)
SSHClient = paramiko.SSHClient
SSHConfig = paramiko.SSHConfig


class ConnectionParams(TypedDict):
    """Type definition for SSH connection parameters."""

    hostname: str
    port: int
    username: str
    key_filename: str | None
    allow_agent: bool


class SSHConfigError(Exception):
    """Raised when SSH configuration cannot be loaded or parsed."""


class SSHConnectionError(Exception):
    """Raised when SSH connection cannot be established."""


class SSHConfigLoader:
    """Handles loading and parsing SSH configuration files with include support."""

    @staticmethod
    def load_config(config_path: str | None = None) -> paramiko.SSHConfig:
        """Load SSH config and handle include directives.

        Paramiko's SSHConfig.parse() doesn't support include directives, so this
        function manually processes them before parsing.

        Args:
            config_path: Path to SSH config file. Defaults to ~/.ssh/config

        Returns:
            Parsed SSHConfig object

        Raises:
            SSHConfigError: If config file doesn't exist or cannot be parsed
        """
        if config_path is None:
            config_path = SSH_CONFIG_DEFAULT_PATH

        expanded_path = os.path.expanduser(config_path)

        if not os.path.exists(expanded_path):
            raise SSHConfigError(f"SSH config file not found: {expanded_path}")

        try:
            return SSHConfigLoader._parse_config_with_includes(expanded_path)
        except Exception as err:
            raise SSHConfigError(
                f"Failed to parse SSH config at {expanded_path}"
            ) from err

    @staticmethod
    def _parse_config_with_includes(config_path: str) -> paramiko.SSHConfig:
        """Parse SSH config file and process include directives.

        Args:
            config_path: Absolute path to SSH config file

        Returns:
            Parsed SSHConfig object
        """
        ssh_config = paramiko.SSHConfig()
        config_dir = os.path.dirname(config_path)

        # First pass: Process include directives
        with open(config_path) as f:
            for line in f:
                stripped_line = line.strip()
                if stripped_line.lower().startswith("include "):
                    SSHConfigLoader._process_include_directive(
                        stripped_line, config_dir, ssh_config
                    )

        # Second pass: Parse the main config file
        with open(config_path) as f:
            ssh_config.parse(f)

        return ssh_config

    @staticmethod
    def _process_include_directive(
        line: str, config_dir: str, ssh_config: paramiko.SSHConfig
    ) -> None:
        """Process a single include directive.

        Args:
            line: The include directive line
            config_dir: Directory containing the main config file
            ssh_config: SSHConfig object to add included configs to
        """
        include_pattern = line.split(None, 1)[1]

        # Expand relative paths
        if not os.path.isabs(include_pattern):
            include_pattern = os.path.join(config_dir, include_pattern)

        # Find all matching files
        include_files = glob.glob(os.path.expanduser(include_pattern))

        if not include_files:
            logger.warning(
                "No files found matching include pattern: %s", include_pattern
            )
            return

        logger.info(
            "Found %d included config files: %s", len(include_files), include_files
        )

        # Parse each included file
        for include_file in sorted(include_files):
            logger.debug("Loading included config: %s", include_file)
            try:
                with open(include_file) as inc_f:
                    ssh_config.parse(inc_f)
            except Exception as err:
                logger.error(
                    "Failed to parse included config %s: %s", include_file, err
                )
                raise


class SSHClientFactory:
    """Factory for creating paramiko SSH clients with full config support."""

    @staticmethod
    def create_client(
        ssh_config: paramiko.SSHConfig,
        host: str,
        timeout: int = DEFAULT_CONNECTION_TIMEOUT,
    ) -> paramiko.SSHClient | None:
        """Create and connect an SSH client using SSH config.

        This function handles all SSH config parameters including ProxyCommand,
        hostname resolution, port, username, identity files, and agent forwarding.

        Args:
            ssh_config: Parsed SSH configuration
            host: Host alias from SSH config
            timeout: Connection timeout in seconds

        Returns:
            Connected SSHClient or None if connection fails

        Raises:
            SSHConnectionError: If connection cannot be established
        """
        client = paramiko.SSHClient()
        # trunk-ignore(bandit/B507)
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            # Lookup host configuration
            host_config = ssh_config.lookup(host)

            # Extract connection parameters
            connection_params = SSHClientFactory._extract_connection_params(
                host, cast(dict[str, str | list[str]], host_config)
            )

            # Create ProxyCommand socket if needed
            sock = SSHClientFactory._create_proxy_socket(
                cast(dict[str, str | list[str]], host_config), connection_params
            )

            # Establish connection
            logger.info(
                "Connecting to %s. Resolved Hostname: %s:%d. Connection User: %s",
                host,
                connection_params["hostname"],
                connection_params["port"],
                connection_params["username"],
            )

            client.connect(
                hostname=connection_params["hostname"],
                port=connection_params["port"],
                username=connection_params["username"],
                key_filename=connection_params["key_filename"],
                allow_agent=connection_params["allow_agent"],
                sock=sock,
                timeout=timeout,
            )

            return client

        except SSHConnectionError:
            # Re-raise our own exceptions without wrapping
            SSHClientFactory._safe_close_client(client)
            raise
        except paramiko.AuthenticationException as err:
            logger.error("Authentication failed for %s: %s", host, err)
            SSHClientFactory._safe_close_client(client)
            raise SSHConnectionError(
                f"Authentication failed for {host}. Check your SSH keys and credentials."
            ) from err
        except paramiko.SSHException as err:
            logger.error("SSH protocol error connecting to %s: %s", host, err)
            SSHClientFactory._safe_close_client(client)
            raise SSHConnectionError(
                f"SSH protocol error connecting to {host}: {err}"
            ) from err
        except TimeoutError as err:
            logger.error("Connection to %s timed out after %d seconds", host, timeout)
            SSHClientFactory._safe_close_client(client)
            raise SSHConnectionError(
                f"Connection to {host} timed out after {timeout} seconds. "
                + "Check network connectivity and firewall rules."
            ) from err
        except OSError as err:
            logger.error("Network error connecting to %s: %s", host, err)
            SSHClientFactory._safe_close_client(client)
            raise SSHConnectionError(
                f"Network error connecting to {host}: {err}. "
                + "Check hostname resolution and network connectivity."
            ) from err
        except Exception as err:
            # Catch-all for unexpected exceptions
            logger.error("Unexpected error connecting to %s: %s", host, err)
            SSHClientFactory._safe_close_client(client)
            raise SSHConnectionError(
                f"Unexpected error connecting to {host}: {type(err).__name__}: {err}"
            ) from err

    @staticmethod
    def _safe_close_client(client: paramiko.SSHClient) -> None:
        """Safely close SSH client, suppressing any errors.

        This is used in exception handlers where we want to ensure the client
        is closed, but don't want closing errors to mask the original exception.

        Args:
            client: SSH client to close
        """
        try:
            client.close()
        except Exception as close_err:
            # Log but don't raise - we're already handling another exception
            logger.debug("Failed to close SSH client: %s", close_err)

    @staticmethod
    def _extract_connection_params(
        host: str, host_config: dict[str, str | list[str]]
    ) -> ConnectionParams:
        """Extract connection parameters from SSH config.

        Args:
            host: Host alias
            host_config: Configuration dictionary from SSHConfig.lookup()

        Returns:
            ConnectionParams dictionary with validated connection parameters

        Raises:
            SSHConnectionError: If required parameters cannot be determined
        """
        # Extract and validate hostname
        raw_hostname = host_config.get("hostname")

        # Handle different hostname scenarios:
        # - If hostname key is missing from config, use host alias
        # - If hostname is explicitly None or empty string, that's an error
        # - If hostname is a valid string, use it
        if "hostname" in host_config:
            # Hostname key exists in config
            if not raw_hostname or not isinstance(raw_hostname, str):
                raise SSHConnectionError(f"Cannot resolve hostname for {host}")
            resolved_hostname = raw_hostname
        else:
            # Hostname key not in config, use host alias as default
            resolved_hostname = host

        # Extract and validate port
        port = SSHClientFactory._extract_port(host_config, host)

        # Extract and validate username
        username = SSHClientFactory._extract_username(host_config, host)

        # Extract key filename
        key_filename = SSHClientFactory._extract_key_filename(host_config)

        # Extract allow_agent setting
        allow_agent = SSHClientFactory._extract_allow_agent(host_config)

        return ConnectionParams(
            hostname=resolved_hostname,
            port=port,
            username=username,
            key_filename=key_filename,
            allow_agent=allow_agent,
        )

    @staticmethod
    def _extract_port(host_config: dict[str, str | list[str]], host: str) -> int:
        """Extract and validate port from SSH config.

        Args:
            host_config: Configuration dictionary from SSHConfig.lookup()
            host: Host alias for error messages

        Returns:
            Validated port number

        Raises:
            SSHConnectionError: If port value is invalid
        """
        port_value = host_config.get("port", str(DEFAULT_SSH_PORT))
        port_str: str = (
            port_value if isinstance(port_value, str) else str(DEFAULT_SSH_PORT)
        )

        try:
            return int(port_str)
        except (ValueError, TypeError) as err:
            raise SSHConnectionError(
                f"Invalid port value '{port_str}' for {host}"
            ) from err

    @staticmethod
    def _extract_username(host_config: dict[str, str | list[str]], host: str) -> str:
        """Extract and validate username from SSH config.

        Args:
            host_config: Configuration dictionary from SSHConfig.lookup()
            host: Host alias for error messages

        Returns:
            Validated username

        Raises:
            SSHConnectionError: If username cannot be determined
        """
        user_value = host_config.get("user")
        username = user_value if isinstance(user_value, str) else None
        username = username or os.environ.get("USER")

        if not username:
            raise SSHConnectionError(
                f"Cannot determine username for {host}. Set 'User' in SSH config."
            )

        return username

    @staticmethod
    def _extract_key_filename(host_config: dict[str, str | list[str]]) -> str | None:
        """Extract key filename from SSH config.

        Args:
            host_config: Configuration dictionary from SSHConfig.lookup()

        Returns:
            Expanded key filename path or None if not configured
        """
        identity_value = host_config.get("identityfile")
        if isinstance(identity_value, list) and identity_value:
            return os.path.expanduser(identity_value[0])
        return None

    @staticmethod
    def _extract_allow_agent(host_config: dict[str, str | list[str]]) -> bool:
        """Extract allow_agent setting from SSH config.

        Args:
            host_config: Configuration dictionary from SSHConfig.lookup()

        Returns:
            True if agent forwarding is enabled, False otherwise
        """
        forward_agent_value = host_config.get("forwardagent", "no")
        forward_agent_str: str = (
            forward_agent_value if isinstance(forward_agent_value, str) else "no"
        )
        return forward_agent_str.lower() == "yes"

    @staticmethod
    def _create_proxy_socket(
        host_config: dict[str, str | list[str]], connection_params: ConnectionParams
    ) -> paramiko.ProxyCommand | None:
        """Create ProxyCommand socket if configured.

        Args:
            host_config: Configuration dictionary from SSHConfig.lookup()
            connection_params: Validated connection parameters

        Returns:
            ProxyCommand socket or None if not configured

        Raises:
            SSHConnectionError: If ProxyCommand setup fails
        """
        proxy_value = host_config.get("proxycommand")
        if not proxy_value:
            return None

        proxy_command_str = proxy_value if isinstance(proxy_value, str) else None
        if not proxy_command_str:
            return None

        # Replace placeholders
        proxy_command_str = proxy_command_str.replace(
            "%h", connection_params["hostname"]
        ).replace("%p", str(connection_params["port"]))

        logger.info("ProxyCommand detected: %s", proxy_command_str)

        try:
            return paramiko.ProxyCommand(proxy_command_str)
        except Exception as err:
            raise SSHConnectionError(
                f"Failed to set up ProxyCommand: {proxy_command_str}"
            ) from err
```

## References

- [Paramiko Documentation](https://docs.paramiko.org/)
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [OpenSSH Config Documentation](https://man.openbsd.org/ssh_config)
