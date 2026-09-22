---
pubDatetime: 2026-09-22T09:37:11Z
title: "How to Connect to GCP MySQL Using Cloud SQL Proxy"
tags:
  - "google cloud"
  - "gcp"
  - "mysql"
  - "mariadb"
heroImage: "/blog-media/2026/09/gcloud-header.webp"
heroThumb: "/blog-media/2026/09/gcloud-thumb.webp"
description: "Connect to a GCP Cloud SQL for MySQL instance from Linux using the Cloud SQL Auth Proxy, IAM authentication and the MariaDB client, without passwords or a public IP on the database."
---

This covers connecting to a Google Cloud Platform (GCP) Cloud SQL for MySQL instance using the Cloud SQL Auth Proxy, IAM authentication, and the MariaDB client on Linux.

## Prerequisites

- Google Cloud SDK (`gcloud`) installed
- Cloud SQL Auth Proxy installed
- MariaDB client installed
- The Cloud SQL Client IAM role on your account

## Step 1: Install the Required Tools

Install the `gcloud` CLI:

```
# Follow instructions at: https://cloud.google.com/sdk/docs/install
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

Install the Cloud SQL Auth Proxy:

```
# Download the proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64
# Make it executable
chmod +x cloud-sql-proxy
# Move to system path
sudo mv cloud-sql-proxy /usr/local/bin/
```

Install the MariaDB client:

```
# On Ubuntu/Debian
sudo apt update
sudo apt install mariadb-client
# On RHEL/CentOS
sudo yum install mariadb
```

## Step 2: Authenticate with Google Cloud

```
# Login to your Google account
gcloud auth login
# Set your project
gcloud config set project my-project-123456
# Login with application default credentials (required for the proxy)
gcloud auth application-default login
```

## Step 3: Find Your Instance Connection Name

```
# List your Cloud SQL instances
gcloud sql instances list
# Get the connection name (format: PROJECT_ID:REGION:INSTANCE_NAME)
gcloud sql instances describe my-instance --format="value(connectionName)"
```

Example output: `my-project-123456:us-central1:my-instance`

## Step 4: Start the Cloud SQL Auth Proxy

Open a terminal and start the proxy:

```
cloud-sql-proxy my-project-123456:us-central1:my-instance --port 3306 --gcloud-auth
```

Leave this terminal running. The proxy stays active and handles encrypted connections to your Cloud SQL instance.

## Step 5: Connect Using IAM Authentication

### Method 1: Token in the Command (Recommended)

In a new terminal window:

```
# Generate a token and store it in a variable
TOKEN=$(gcloud sql generate-login-token)
# Connect to MySQL
mariadb -umyuser --host=localhost --port=3306 --password="$TOKEN" --skip-ssl
```

A few things worth knowing:

- Use the database username shown in GCP Console > Cloud SQL > Users, not your full email address
- `--skip-ssl` is needed because the proxy already encrypts the connection

### Method 2: `gcloud sql connect` (Easiest)

```
gcloud sql connect my-instance --user=myuser
```

This handles authentication automatically.

### Method 3: Pipe the Token Directly

```
gcloud sql generate-login-token | mariadb -umyuser --host=localhost --port=3306 --password --skip-ssl
```

When prompted for a password, the token is piped in automatically.

## Step 6: Verify the Connection

```
-- Show current user
SELECT USER();
-- List databases you have access to
SHOW DATABASES;
-- Switch to a specific database
USE your_database_name;
-- Show tables
SHOW TABLES;
```

## Troubleshooting

**Error: "Access denied for user"**

- Verify your username matches exactly what's in GCP Console > Cloud SQL > Users
- Check that the user's authentication type is IAM, not Built-in
- Ensure you have the Cloud SQL Client role in IAM

**Error: "TLS/SSL error: SSL is required"**

- Add `--skip-ssl` to the `mariadb` command
- The proxy handles encryption, so SSL isn't needed on the client side

**Error: "Could not connect to instance"**

- Verify the Cloud SQL Auth Proxy is still running in its terminal
- Check the instance connection name is correct
- Make sure your credentials are current: `gcloud auth application-default login`

**Can't access certain databases**

You likely need database-level grants. Connect as an admin user (`root`, or a user with `GRANT` privileges) and run:

```
GRANT ALL PRIVILEGES ON database_name.* TO 'myuser'@'%';
FLUSH PRIVILEGES;
```

## Setting Up a New IAM User in Cloud SQL

1. Go to GCP Console > Cloud SQL > your instance > Users
2. Click "Add User Account"
3. Select "Cloud IAM" as the authentication type
4. Enter the Google account email for the user

The database username is derived from the email address.

Then grant the IAM permission:

```
gcloud projects add-iam-policy-binding my-project-123456 \
  --member='user:myuser@mydomain.com' \
  --role='roles/cloudsql.client'
```

## Creating an Alias for Easy Connection

Add this to `~/.bashrc` or `~/.zshrc`:

```
alias mysql-dev='TOKEN=$(gcloud sql generate-login-token) && mariadb -umyuser --host=localhost --port=3306 --password="$TOKEN" --skip-ssl'
```

Then simply run:

```
mysql-dev
```

## Best Practices

- Always use the Cloud SQL Auth Proxy for secure connections rather than exposing a public IP
- Prefer IAM authentication over password-based authentication where you can
- Keep the proxy running in a dedicated terminal or as a background service
- Regenerate tokens for each connection; they expire after an hour
- Use `--skip-ssl` with the proxy to avoid unnecessary overhead
- Grant only the database privileges a user actually needs

## References

[Connect using the Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/mysql/sql-proxy)

[Cloud SQL IAM database authentication](https://cloud.google.com/sql/docs/mysql/authentication)

[gcloud sql command reference](https://cloud.google.com/sdk/gcloud/reference/sql)

See also: [GCloud SSH Tunnelling](/posts/gcloud-ssh-tunnelling/)
