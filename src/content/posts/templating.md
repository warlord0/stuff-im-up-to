---
pubDatetime: 2021-01-25T21:39:39Z
modDatetime: 2021-01-27T21:47:18Z
title: "Templating"
tags:
  - "bash"
  - "Linux"
  - "python"
description: "Quite often I find myself creating files using a template that populates content using the projects .env file. Mostly I find myself using good old bash to"
---
Quite often I find myself creating files using a template that populates content using the projects `.env` file. Mostly I find myself using good old bash to do this for me, but it has some limitations. Today I resorted to [Jinja2](https://jinja2docs.readthedocs.io/en/stable/) which adds a lot more flexibility, but requires python and the Jinja2 module.

## Using BASH

Using a bash script is easy and short:

```
#!/bin/bash

source .env

function render_template() {
  eval "echo \"$(cat $1)\""
}

render_template ./nginx.template.conf > ./nginx.conf
```

With an nginx template that looks like:

```
server {
    listen       ${IP:-0.0.0.0}:443 ssl http2;
    server_name  ${HOST}.${DOMAIN};

    ssl_certificate_key     /etc/letsencrypt/live/${HOST}.${DOMAIN}/privkey.pem;
    ssl_certificate         /etc/letsencrypt/live/${HOST}.${DOMAIN}/fullchain.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/${HOST}.${DOMAIN}/fullchain.pem;
```

But the difficulties arrive with lines containing `$`'s. Easy enough to resolve, they must be escaped with a `\` back slash.

```
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-Host  \$host;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Server-Select   \$scheme;
        proxy_set_header X-Forwarded-Proto \$scheme;
```

## Using Jinja2

Because I want to use the same `.env` I need to use Jinja2 and python-dotenv.

```
pip install python-dotenv jinja2
```

```
#!/bin/bash

set -e

source .env

readonly PYTHON_JINJA2="import os;
import sys;
import jinja2;
from dotenv import load_dotenv;
reload(sys)
sys.setdefaultencoding('utf-8')
load_dotenv(verbose=True)
sys.stdout.write(
    jinja2.Template
        (sys.stdin.read()
    ).render(env=os.environ))"

cat realm.template.json | python -c "${PYTHON_JINJA2}" > realm.output.json
```

This is a snippet of the template:

```
{
    "id": "{{ env['HOST'] }}",
    "realm": "{{ env['HOST'] }}",
    "displayName": "{{ env['LDAP_ORGANISATION'] }}",
            "usersDn": [
              "ou=People,{{ env['LDAP_BASE_DN'] }}"
            ],
```
