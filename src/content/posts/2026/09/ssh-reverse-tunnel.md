---
pubDatetime: 2026-09-16T13:55:01+00:00
title: "Git and apt via SSH Reverse Tunnel"
tags:
  - "SSH"
  - "Git"
  - "Networking"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.webp"
heroThumb: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico-thumb.webp"
description: "Some customer sites block outbound SSH, and sometimes HTTP/HTTPS too, which breaks git, apt and pip on the remote machine even when everything is otherwise configured correctly. A reverse SSH tunnel piggybacks on the inbound connection you already have to route that traffic back out through your own machine instead…"
---

## Git and apt Access via SSH Reverse Tunnel

## Background

Some customer sites block outbound SSH (port 22) at the network level. This prevents `git` from cloning or pushing to GitHub using SSH, even if the deploy key is correctly configured on the remote machine. In some cases outbound HTTP/HTTPS may also be restricted, breaking `apt` and `pip` package installation.

> **NOTE**: This applies to any customer systems that sit within a firewall like this — it's not specific to one particular setup.

The solution is to create a **reverse SSH tunnel** from your local machine to the customer machine, forwarding ports through to the required services. Traffic on the customer machine then connects via `localhost` instead of directly to the internet, bypassing the firewall restriction.

This works because:

- You already have an SSH connection into the customer machine (inbound SSH is allowed)
- Your local machine can reach GitHub and the internet without restriction
- The tunnel piggybacks traffic through your existing SSH session

---

## Prerequisites

- An active SSH connection (or control socket) to the customer machine
- Your local machine can reach `github.com` on port 22
- Docker installed on your local machine (for the HTTP proxy)
- A deploy key configured on the customer machine at `/root/.ssh/github_deploy_key`
- The customer machine's `/root/.ssh/config` contains:

```text
Host github.com
  HostName localhost
  Port 2222
  User git
  IdentityFile /root/.ssh/github_deploy_key
  StrictHostKeyChecking no
```

> **NOTE:** The `HostName localhost` and `Port 2222` entries redirect all `github.com` SSH traffic through the tunnel. Without these, you would need to specify the port manually every time.

---

## Setting Up the HTTP Proxy

As well as SSH access, you'll likely need to install packages via `apt` or `pip` on the customer machine. These tools expect an **HTTP proxy** rather than a SOCKS proxy — and Python's pip in particular requires an extra dependency (`pysocks`) to use SOCKS, which creates a chicken-and-egg problem on modern systems (PEP 668 prevents pip installing system-wide packages directly).

The cleanest solution is to run a lightweight HTTP proxy (**tinyproxy**) on your local machine using Docker:

```bash
docker run -d \
  --name tinyproxy \
  -p 8888:8888 \
  vimagick/tinyproxy
```

This starts tinyproxy listening on port 8888 of your local machine, with no configuration needed. Stop and remove it when you're done:

```bash
docker stop tinyproxy && docker rm tinyproxy
```

---

## Opening the Tunnels

From your **local machine**, run:

```bash
ssh -R 2222:github.com:22 -R 8888:localhost:8888 <customer-system>
```

What this does:

- `-R 2222:github.com:22` — forwards port `2222` on the customer machine through your local machine to `github.com:22` for git/SSH access
- `-R 8888:localhost:8888` — forwards port `8888` on the customer machine back to tinyproxy running on your local machine, giving the customer machine outbound HTTP/HTTPS access

Leave this terminal open for the duration of your work. The tunnels close when you exit or disconnect.

---

## Using Git on the Customer Machine

Once the tunnel is open, SSH to the customer machine and use git normally:

```bash
git clone git@github.com:YourOrg/your-repo.git
git pull
git push
```

Because `/root/.ssh/config` redirects `github.com` to `localhost:2222`, all git SSH traffic will flow through your tunnel transparently.

---

## Using apt on the Customer Machine

```bash
apt-get -o Acquire::http::Proxy="http://localhost:8888" update
apt-get -o Acquire::http::Proxy="http://localhost:8888" install <package>
```

Or set it persistently for the session:

```bash
export http_proxy=http://localhost:8888
export https_proxy=http://localhost:8888
apt-get update && apt-get install <package>
```

---

## Using pip on the Customer Machine

Add the proxy to the venv's `pip.conf` so it's used automatically:

```bash
cat > /path/to/venv/pip.conf << EOF
[global]
proxy = http://localhost:8888
EOF
```

Or pass it per-command:

```bash
pip install --proxy http://localhost:8888 <package>
```

> **Why not SOCKS?** SSH tunnels create a SOCKS proxy by default (`-D` flag), but pip requires the `pysocks` package to use SOCKS. On modern systems (PEP 668), pip cannot install packages system-wide, creating a catch-22. Using an HTTP proxy via tinyproxy avoids this entirely.

---

## Alternative: Reverse SOCKS Proxy for apt (no Docker/tinyproxy needed)

Instead of running tinyproxy in Docker, `apt` can be pointed straight at a **reverse dynamic (SOCKS) forward** created by SSH itself, with no extra proxy process required on either end.

### Opening the reverse SOCKS tunnel

From your **local machine**:

```bash
ssh -R 1080 <customer-system>
```

`-R 1080` (with no destination host/port) tells SSH to open a **reverse dynamic forward**: it starts a SOCKS proxy on `localhost:1080` on the _customer_ machine, which routes connections back through the tunnel and out via your local machine's network — the same mechanism as a normal `-D` dynamic forward, just running in the opposite direction.

### Configuring apt to use it

apt's `libcurl`-based http/https transport can talk to a SOCKS proxy directly via the `socks5h://` scheme, so no bridging tool (privoxy, polipo, etc.) is needed. Add this to `/etc/apt/apt.conf.d/90socks-proxy` on the customer machine:

```text
Acquire::http::Proxy "socks5h://localhost:1080/";
Acquire::https::Proxy "socks5h://localhost:1080/";
```

`socks5h` (as opposed to plain `socks5`) resolves DNS hostnames through the proxy rather than locally on the customer machine — important here, since the customer machine's own DNS/firewall may not be able to resolve or reach the package mirrors directly.

Then use apt as normal:

```bash
apt-get update
apt-get install <package>
```

### Comparison with the tinyproxy approach

|                              | tinyproxy (HTTP proxy)                  | reverse SOCKS (`ssh -R 1080`)                                   |
| ---------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Extra process required       | Yes — Docker container on local machine | No — built into the SSH tunnel                                  |
| Works for pip out of the box | Yes                                     | No — still needs `pysocks`, same PEP 668 issue as `-D`          |
| Works for apt out of the box | Yes                                     | Yes, if apt's http/https transport was built with SOCKS support |
| Setup complexity             | Docker + one extra `-R` forward         | Single `-R 1080` flag, one `apt.conf.d` file                    |

In practice: use the reverse SOCKS proxy when you only need `apt` and want to avoid running Docker/tinyproxy locally; fall back to tinyproxy when you also need `pip`, or if the customer machine's apt isn't built with SOCKS support (older Debian/Ubuntu images sometimes aren't).

---

## Verifying the Tunnels are Working

**Git/SSH:**

```bash
ssh -T git@github.com
```

Expected response:

```text
Hi YourOrg! You've successfully authenticated, but GitHub does not provide shell access.
```

**HTTP proxy (tinyproxy):**

```bash
curl -x http://localhost:8888 https://pypi.org
```

Should return an HTTP 200 response.

**Reverse SOCKS proxy:**

```bash
curl -x socks5h://localhost:1080 https://pypi.org
```

Should return an HTTP 200 response.

---

## Closing the Tunnels

Exit or Ctrl+C the terminal running the `ssh -R` command on your local machine. Then stop the proxy (if using tinyproxy):

```bash
docker stop tinyproxy && docker rm tinyproxy
```

---

## Troubleshooting

`bind: Address already in use` — Port 2222, 8888, or 1080 is already in use on the customer machine. Try different ports and update `/root/.ssh/config`, `pip.conf`, or `apt.conf.d` to match.

`Connection refused` **on the customer machine** — The tunnel isn't running. Go back to your local machine and run the `ssh -R` command.

`kex_exchange_identification: read: Connection reset by peer` — Git is trying to connect directly to GitHub rather than through the tunnel. Check that `/root/.ssh/config` is configured correctly with `HostName localhost` and `Port 2222`.

**pip SOCKS error (**`Missing dependencies for SOCKS support`**)** — pip is trying to use a SOCKS proxy. Make sure you're using the HTTP proxy (`http://localhost:8888`) rather than a SOCKS address, and that `pip.conf` is configured correctly inside the venv.

**apt SOCKS error / falls back to direct connection** — apt's transport wasn't built with SOCKS support. Fall back to the tinyproxy HTTP proxy approach above instead.

**Tunnel drops during long operations** — Add keepalive options to your local SSH command:

```bash
ssh -R 2222:github.com:22 -R 8888:localhost:8888 -R 1080 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 <customer-system>
```
