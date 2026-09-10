---
pubDatetime: 2021-01-26T13:16:44Z
modDatetime: 2021-01-27T21:48:23Z
title: "Keycloak API"
tags:
  - "keycloak"
  - "ldap"
  - "Linux"
heroImage: "/blog-media/2020/07/keycloak.png"
description: "Keycloak is a great tool for authentication and I'm bundling it into a package that includes LDAP. What I want to do is automate the deployment of Keycloak"
---
Keycloak is a great tool for authentication and I'm bundling it into a package that includes LDAP. What I want to do is automate the deployment of Keycloak so that it is provisioned to work with the LDAP that is also deployed without the user having to fettle with Keycloak manually- This is where the [Keycloak API](https://www.keycloak.org/docs-api/12.0/rest-api/) comes in.

The documentation is here: [https://www.keycloak.org/docs-api/12.0/rest-api/](https://www.keycloak.org/docs-api/12.0/rest-api/)

My tool of choice to get started is VSCode with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plugin. It makes it easy for me to prototype API calls and then when I'm done easily translate them in curl or into many languages such as node.js and axios calls.

Everything is being built from `.env` and is templated to make the build specific to the environment it will be used it.

#### Sample `.env`

```
# This will build the URLS, eg. subdomain.domain.tld
HOST=subdomain
DOMAIN=domain.tld

LDAP_ADMIN_PASSWORD=SecretKey
LDAP_BASE_DN=dc=domain,dc=tld
LDAP_CONFIG_PASSWORD=SuperSecretKey
LDAP_DOMAIN=domain.tld
LDAP_ORGANISATION="My Domain"
LDAP_READONLY_USER=true
LDAP_READONLY_USER_PASSWORD=NotSoSecretKey
LDAP_RFC2307BIS_SCHEMA=true
LDAP_TLS=true
LDAP_TLS_VERIFY_CLIENT=never

KEYCLOAK_PASSWORD=SuperSecretKey

# These can be generated with "openssl rand -hex 32" as no human needs them
POSTGRES_PASSWORD=SuperSecretKey
KEYCLOAK_POSTGRES_PASSWORD=SuperSecretKey
```

First of all I want to create the realm I'm going to be working with. As you can see from the `.env` I can use much of the LDAP config to build the realm.

Create a `.http` file in VSCode to use with the REST Client.

### keycloak.http

First call to the keycloak API must be to authenticate and get a token. Here you see I have parameterised much of what I can with Jinja2 style replacements `$dotenv`.

Where ever you see `http://127.0.0.1:8080` it is assumed this is where your Keycloak server is serving. It could be vastly different based on your environment.

```
# @name get_token

POST http://127.0.0.8080/auth/realms/master/protocol/openid-connect/token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=admin-cli&username=admin&password={{$dotenv KEYCLOAK_PASSWORD}}
```

If I send this request using ALT+CTRL+R I should get back a response containing an `access_token`. I need to save this token and use it in the next call. The tokens are very short lived so you need a new one every minute.

Now I need to add into my `.http` file the commands to create the realm. The `###` denotes a new REST call. and you'll see I'm assigning a variable `@access_token` with the value of the response from the previous `get_token` call.

For this I need to include the JSON that contains all the values required. But notice the template functions for `$dotenv` again.

```
###

# @name create_realm

@access_token = {{get_token.response.body.access_token}}
POST http://127.0.0.1:8080/auth/admin/realms
Content-Type: application/json
Authorization: bearer {{access_token}}

{
  "id": "{{$dotenv HOST}}",
  "realm": "{{$dotenv HOST}}",
  "displayName": "{{$dotenv LDAP_ORGANISATION}}",
  "displayNameHtml": "{{$dotenv LDAP_ORGANISATION}}",
  "notBefore": 0,
  "revokeRefreshToken": false,
  "refreshTokenMaxReuse": 0,
  "accessTokenLifespan": 300,
  "accessTokenLifespanForImplicitFlow": 900,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "ssoSessionIdleTimeoutRememberMe": 0,
  "ssoSessionMaxLifespanRememberMe": 0,
  "offlineSessionIdleTimeout": 2592000,
  "offlineSessionMaxLifespanEnabled": false,
  "offlineSessionMaxLifespan": 5184000,
  "clientSessionIdleTimeout": 0,
  "clientSessionMaxLifespan": 0,
  "clientOfflineSessionIdleTimeout": 0,
  "clientOfflineSessionMaxLifespan": 0,
  "accessCodeLifespan": 60,
  "accessCodeLifespanUserAction": 300,
  "accessCodeLifespanLogin": 1800,
  "actionTokenGeneratedByAdminLifespan": 43200,
  "actionTokenGeneratedByUserLifespan": 300,
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": true,
  "registrationEmailAsUsername": false,
  "rememberMe": true,
  "verifyEmail": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": false,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  "defaultRoles": [
    "uma_authorization",
    "offline_access"
  ],
  "requiredCredentials": [
    "password"
  ],
  "otpPolicyType": "totp",
  "otpPolicyAlgorithm": "HmacSHA1",
  "otpPolicyInitialCounter": 0,
  "otpPolicyDigits": 6,
  "otpPolicyLookAheadWindow": 1,
  "otpPolicyPeriod": 30,
  "otpSupportedApplications": [
    "FreeOTP",
    "Google Authenticator"
  ],
  "webAuthnPolicyRpEntityName": "keycloak",
  "webAuthnPolicySignatureAlgorithms": [
    "ES256"
  ],
  "webAuthnPolicyRpId": "",
  "webAuthnPolicyAttestationConveyancePreference": "not specified",
  "webAuthnPolicyAuthenticatorAttachment": "not specified",
  "webAuthnPolicyRequireResidentKey": "not specified",
  "webAuthnPolicyUserVerificationRequirement": "not specified",
  "webAuthnPolicyCreateTimeout": 0,
  "webAuthnPolicyAvoidSameAuthenticatorRegister": false,
  "webAuthnPolicyAcceptableAaguids": [],
  "webAuthnPolicyPasswordlessRpEntityName": "keycloak",
  "webAuthnPolicyPasswordlessSignatureAlgorithms": [
    "ES256"
  ],
  "webAuthnPolicyPasswordlessRpId": "",
  "webAuthnPolicyPasswordlessAttestationConveyancePreference": "not specified",
  "webAuthnPolicyPasswordlessAuthenticatorAttachment": "not specified",
  "webAuthnPolicyPasswordlessRequireResidentKey": "not specified",
  "webAuthnPolicyPasswordlessUserVerificationRequirement": "not specified",
  "webAuthnPolicyPasswordlessCreateTimeout": 0,
  "webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister": false,
  "webAuthnPolicyPasswordlessAcceptableAaguids": [],
  "browserSecurityHeaders": {
    "contentSecurityPolicyReportOnly": "",
    "xContentTypeOptions": "nosniff",
    "xRobotsTag": "none",
    "xFrameOptions": "SAMEORIGIN",
    "contentSecurityPolicy": "frame-src 'self'; frame-ancestors 'self'; object-src 'none';",
    "xXSSProtection": "1; mode=block",
    "strictTransportSecurity": "max-age=31536000; includeSubDomains"
  },
  "smtpServer": {},
  "loginTheme": "",
  "accountTheme": "",
  "adminTheme": "",
  "eventsEnabled": false,
  "eventsListeners": [
    "jboss-logging"
  ],
  "enabledEventTypes": [],
  "adminEventsEnabled": false,
  "adminEventsDetailsEnabled": false,
  "identityProviders": [],
  "identityProviderMappers": [],
  "internationalizationEnabled": false,
  "supportedLocales": [
    ""
  ],
  "browserFlow": "browser",
  "registrationFlow": "registration",
  "directGrantFlow": "direct grant",
  "resetCredentialsFlow": "reset credentials",
  "clientAuthenticationFlow": "clients",
  "dockerAuthenticationFlow": "docker auth",
  "attributes": {
    "clientOfflineSessionMaxLifespan": "0",
    "clientSessionIdleTimeout": "0",
    "clientSessionMaxLifespan": "0",
    "frontendUrl": "",
    "clientOfflineSessionIdleTimeout": "0"
  },
  "userManagedAccessAllowed": false
}
```

I must first submit a `get_token` call to the API using ALT+CTRL+R and immediately click on this `create_realm` call and ALT+CTRL+R to send this. If I go into the admin interface I should see my realm has been created.

> Don't get too concerned about where all that JSON came from I will explain that later, but for now be happy that you understand the paramerisation and the delivery of the call to the API using the REST Client.

The final stage is to create a "User Federation" component for our LDAP configuration. This took me a little time to figure out. In API terms the user federation falls under the `components` call.

Let's add another API call to create the component, again in reuses the `access_token`:

```
###

# @name create_ldap

@access_token = {{get_token.response.body.access_token}}
POST http://127.0.0.1:8080/auth/admin/realms/{{$dotenv HOST}}/components
Content-Type: application/json
Authorization: bearer {{access_token}}

{
    "name": "ldap",
    "providerId": "ldap",
    "providerType": "org.keycloak.storage.UserStorageProvider",
    "parentId": "{{$dotenv HOST}}",
    "config": {
        "enabled": [
            "true"
        ],
        "priority": [
            "0"
        ],
        "fullSyncPeriod": [
            "-1"
        ],
        "changedSyncPeriod": [
            "-1"
        ],
        "cachePolicy": [
            "DEFAULT"
        ],
        "evictionDay": [],
        "evictionHour": [],
        "evictionMinute": [],
        "maxLifespan": [],
        "batchSizeForSync": [
            "1000"
        ],
        "editMode": [
            "WRITABLE"
        ],
        "importEnabled": [
            "true"
        ],
        "syncRegistrations": [
            "false"
        ],
        "vendor": [
            "other"
        ],
        "usePasswordModifyExtendedOp": [],
        "usernameLDAPAttribute": [
            "uid"
        ],
        "rdnLDAPAttribute": [
            "uid"
        ],
        "uuidLDAPAttribute": [
            "entryUUID"
        ],
        "userObjectClasses": [
            "inetOrgPerson, organizationalPerson"
        ],
        "connectionUrl": [
            "ldap://slapd"
        ],
        "usersDn": [
            "ou=People,{{$dotenv LDAP_BASE_DN}}"
        ],
        "authType": [
            "simple"
        ],
        "startTls": [],
        "bindDn": [
            "cn=admin,{{$dotenv LDAP_BASE_DN}}"
        ],
        "bindCredential": [
            "{{$dotenv LDAP_ADMIN_PASSWORD}}"
        ],
        "customUserSearchFilter": [
            "(objectClass=person)"
        ],
        "searchScope": [
            "2"
        ],
        "validatePasswordPolicy": [
            "false"
        ],
        "trustEmail": [
            "false"
        ],
        "useTruststoreSpi": [
            "ldapsOnly"
        ],
        "connectionPooling": [
            "true"
        ],
        "connectionPoolingAuthentication": [],
        "connectionPoolingDebug": [],
        "connectionPoolingInitSize": [],
        "connectionPoolingMaxSize": [],
        "connectionPoolingPrefSize": [],
        "connectionPoolingProtocol": [],
        "connectionPoolingTimeout": [],
        "connectionTimeout": [],
        "readTimeout": [],
        "pagination": [
            "true"
        ],
        "allowKerberosAuthentication": [
            "false"
        ],
        "serverPrincipal": [],
        "keyTab": [],
        "kerberosRealm": [],
        "debug": [
            "false"
        ],
        "useKerberosForPasswordAuthentication": [
            "false"
        ]
    }
}
```

Again first send a `get_token` then send this `create_ldap` immediately after. This should create the component `ldap` under the "User Federation" menu.

We now have Keycloak configured and ready to talk with our LDAP for authentication. Because it's set as WRITABLE you can go to the account management page and register a new user. This user should then get created in LDAP for us.

[http://127.0.0.1:8080/auth/realms/subdomain/account/#/](#)

## A Deeper Understanding

So where did I get the JSON from so I knew the structure of the data required to make this happen? It's in the documentation if you want to read and untangle it. But I found it easier to query or capture it from a working Keycloak instance as I configured it.

To get the JSON to create the realm, I used the VSCode REST Client to do a GET query the master realm. Then modified what it responded with by adding parameters to pass to the POST. This is the call I made:

```
###

# @name show_realm
@access_token = {{get_token.response.body.access_token}}
GET http://127.0.0.1:8080/auth/admin/realms/master
Content-Type: application/json
Authorization: bearer {{access_token}}
```

Remember the call to `get_token` first.

OK what about the JSON for the LDAP component creation?

For this I used the Keycloak web GUI and went into the user federation menu, chose to add a provider and then used the chrome debug console to monitor the network. When I saved the new LDAP provider I could see the call to create the component and copied the call "as cURL". I then pasted the curl command into a new code page and you can see the JSON in the `--data-binary`. Now it's just a case of copying out the JSON only, using a format document command to make it look human readable, instead of all being on one long line. From there it's easy to just change the things I entered into parameters and add that to the `create_ldap` call.

## Next Steps

Now I can use the API to deploy the configuration I need to convert my VSCode REST Client calls to something I can make programatically. For this I need to borrow from a previous article for [Templating](/posts/templating/). The end users aren't going to want to use VSCode to deploy Keycloak - I'll convert this to a bash script and Jinja2 templates.

First convert the call to get_token into a curl call - right click, Copy Request as cURL.

```
curl --request POST \
  --url http://127.0.0.1:8080/auth/realms/master/protocol/openid-connect/token \
  --header 'content-type: application/x-www-form-urlencoded' \
  --header 'user-agent: vscode-restclient' \
  --data grant_type=password \
  --data client_id=admin-cli \
  --data username=admin \
  --data password=SuperSecretKey
```

It loses all the parameters as they've become hard coded values, but we can add that back in a bash script. Using `source .env` brings all our variables from `.env` into play.

```
#!/bin/bash

source .env

TOKEN=$(curl --request POST \
  --url http://127.0.0.1:8080/auth/realms/master/protocol/openid-connect/token \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=password \
  --data client_id=admin-cli \
  --data username=admin \
  --data password=${KEYCLOAK_PASSWORD}
  --silent | jq -r '.access_token')
```

By piping through `jq -r` we can get just the `access_token` (with no quotes).

```
curl --request POST \
  --url http://127.0.0.1:8080/auth/admin/realms \
  --header "authorization: bearer ${TOKEN}" \
  --header 'content-type: application/json' \
  --header 'user-agent: vscode-restclient' \
  --data @create_realm.json
```

It's at this point I take the JSON and put it into a separate file `create_realm.template.json` to keep the bash script readable, and so I can run a Jinja2 template over it first. I've cut out all the config to only show the relevant parts where I changed them to Jinja2 template attributes.

```
{
    "id": "{{ env['HOST'] }}",
    "realm": "{{ env['HOST'] }}",
    "displayName": "{{ env['LDAP_ORGANISATION'] }}",
```

The script now looks like this to authenticate, run the Jinja2 template engine over the template file and then run the create realm curl. Similarly I did the same conversion on the `create_ldap.template.json`.

```
#!/bin/bash

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

TOKEN=$(curl --request POST \
  --url http://127.0.0.1:8080/auth/realms/master/protocol/openid-connect/token \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=password \
  --data client_id=admin-cli \
  --data username=admin \
  --data password=${KEYCLOAK_PASSWORD}
  --silent | jq -r '.access_token')

cat create_realm.template.json | python -c "${PYTHON_JINJA2}" > create_realm.json

curl --request POST \
  --url http://127.0.0.1:8080/auth/admin/realms \
  --header "authorization: bearer ${TOKEN}" \
  --header 'content-type: application/json' \
  --header 'user-agent: vscode-restclient' \
  --data @create_realm.json

cat create_ldap.template.json | python -c "${PYTHON_JINJA2}" > create_ldap.json

curl --request POST \
  --url http://127.0.0.1:8080/auth/admin/realms/subdomain/components \
  --header "authorization: bearer ${TOKEN}" \
  --header 'content-type: application/json' \
  --header 'user-agent: vscode-restclient' \
  --data @create_ldap.json
```

Of course there's some error checking I should probably put in here for completeness, but this is an example of a working script that builds Keycloak based on the LDAP settings in a `.env`.

## Prerequisites

You'll need curl, jq, python with jinja2 and python-dotenv modules.

```
sudo apt install curl jq python-pip
sudo pip install jinja2 python-dotenv
```
