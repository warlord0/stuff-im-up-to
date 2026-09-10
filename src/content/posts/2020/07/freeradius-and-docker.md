---
pubDatetime: 2020-07-07T19:25:36Z
modDatetime: 2023-04-21T17:48:34Z
title: "FreeRADIUS and Docker"
tags:
  - "Docker"
  - "ldap"
  - "Linux"
  - "radius"
  - "Security"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "Today I built a FreeRADIUS server within a Docker container set using docker-compose. As we only have a small number of users on the WiFi system it was set"
---
Today I built a FreeRADIUS server within a Docker container set using docker-compose. As we only have a small number of users on the WiFi system it was setup only as a simple SSID with WPA-PSK that gradually gets spread to every man and his dog.

Fortunately it only acts as a Guest network and provides internet access - but the next step is to have a proper corporate SSID with secure LAN access. For this we want 802.1X and a RADIUS server to provide integration between wireless and LDAP.

I started off with the official `freeradius/freeradius-server:3.0.21-alpine` image and from there started to link in the configuration changes to match our needs.

#### docker-compose.yml

```
version: '3.2'

services: 
  freeradius:
    image: ${FREERADIUS_IMAGE:-free-radius/freeradius/freeradius-server}:${FREERADIUS_IMAGE_VERSION:-3.0.21-alpine}
    volumes:
      - "${PWD}/raddb/mods-enabled/ldap:/etc/raddb/mods-enabled/ldap:ro"
      - "${PWD}/raddb/clients.conf:/etc/raddb/clients.conf:ro"
      - "${PWD}/raddb/users:/etc/raddb/mods-config/files/authorize:ro"
      - "${PWD}/logs/:/opt/var/log/radius/radacct/:rw"
    ports:
      - "1812-1813:1812-1813/udp"
    command: ["radiusd", "-X", "-t"] # Debug mode with colour
```

This is the current research and development configuration. Normally we'd place folders such as logs into places other than `${PWD}`.

You'll notice the additions to the config that override the configuration settings for the `mods-enabled` and the `users`. The users won't be required in production, but I thought for testing I'd stick with the user `bob` and ensure that my calls to `radtest` worked as expected.

#### users

```
bob    Cleartext-Password := "hello"
       Reply-Message := "Hello, %{User-Name}"
```

In my clients I ensured the workstation I was testing from was able to authenticate by adding in the following:

#### clients.conf

```
client test {
  ipaddr = 192.168.0.194
  proto = *
  secret = testing123
  require_message_authenticator = no
  nas_type = other
}
```

I had to use another workstation to test from as using docker every time I started up the container set the service would get a different IP address like 172.23.0.1 and then 172.24.0.1 so testing locally wasn't possible as it would have required me to add in the `ipaddr` of the service, which I wouldn't know until after it started.

#### ldap

```
ldap {
    server = 'server'
    identity = 'cn=admin,dc=domain,dc=tld'
    password = SuperSecretKey
    base_dn = 'd,dc=domain,dc=tld'
    sasl {
    }
    global {
    }
    update {
        &control:Password-With-Header   += 'userPassword'
        &control:           += 'radiusControlAttribute'
        &request:           += 'radiusRequestAttribute'
        &reply:             += 'radiusReplyAttribute'
    }
    user {
        base_dn = "${..base_dn}"
        filter = "(uid=%{%{Stripped-User-Name}:-%{User-Name}})"
        sasl {
        }
    }
    group {
        base_dn = "${..base_dn}"
        filter = '(objectClass=posixGroup)'
        membership_attribute = 'memberOf'
        group_attribute = "${.:instance}-Group"
    }
    profile {
    }
    accounting {
        reference = "%{tolower:type.%{Acct-Status-Type}}"
        type {
            start {
                update {
                    description := "Online at %S"
                }
            }
            interim-update {
                update {
                    description := "Last seen at %S"
                }
            }
            stop {
                update {
                    description := "Offline at %S"
                }
            }
        }
    }
    post-auth {
        update {
            description := "Authenticated at %S"
        }
    }
    options {
        chase_referrals = yes
        rebind = yes
        use_referral_credentials = no
        res_timeout = 10
        srv_timelimit = 3
        idle = 60
        probes = 3
        interval = 3
        ldap_debug = 0x0000
    }
    tls {
    }
    pool {
        start = 1
        min = 1
        max = 5
        spare = 1
        uses = 0
        retry_delay = 30
        lifetime = 0
        idle_timeout = 60
        connect_timeout = 3.0
    }
}
```

I made only a few changes to the standard `ldap` file, the one above I stripped all the comments from. It was important that I used the `admin` account as the `readonly` account would fail with the following in the log:

```
freeradius_1  | (0) ldap: WARNING: No "known good" password added. Ensure the admin user has permission to read the password attribute
```

The other changes I made related to parameters in the `pool {}` section that were not available, which were as follows:

```
start = ${thread[pool].num_workers}
min = ${thread[pool].num_workers}
max = ${thread[pool].num_workers}
```

You can see the settings I chose in the above `ldap` file. They may need tweaking in production.

## Testing

After starting the container I carried out the basic `bob` test using `radtest`. For this I had to install the `freeradius-utls` package on the client I was testing from.

```
$ radtest bob hello 192.168.0.126 0 testing123

Sent Access-Request Id 36 from 0.0.0.0:35412 to 192.168.0.126:1812 length 73
    User-Name = "bob"
    User-Password = "hello"
    NAS-IP-Address = 127.0.1.1
    NAS-Port = 0
    Message-Authenticator = 0x00
    Cleartext-Password = "hello"
Received Access-Accept Id 36 from 192.168.0.126:1812 to 0.0.0.0:0 length 32
    Reply-Message = "Hello, bob"
```

With a successful `Accept-Accept` response.

Then I wanted to test as if I were a wireless client connecting as my access points were in the office and I'd setup the RADIUS server remotely from home - so how do I emulate a wireless client? I wrote about this previously, using `radclient` - [RADIUS Testing](https://warlord0blog.wordpress.com/2018/11/05/radius-testing/) which enabled me to try out an EAP authentication session and establish that my next step on a configure access point should be successful.

```
$ cat << EOF | radclient -x 192.168.0.126 auth testing123
User-Name = myldapuser
User-Password = secretkey
NAS-Port-Type = 19
NAS-Port = 0
Calling-Station-Id = SSID
EOF
Sent Access-Request Id 198 from 0.0.0.0:42221 to 192.168.0.126:1812 length 72
    User-Name = "myldapuser"
    User-Password = "secretkey"
    NAS-Port-Type = Wireless-802.11
    NAS-Port = 0
    Calling-Station-Id = "SSID"
    Cleartext-Password = "secretkey"
Received Access-Accept Id 198 from 192.168.0.126:1812 to 0.0.0.0:0 length 20
```

Good news it's too was successful. Now I just have to configure my access points.

## Further Development

It would probably be best to modify the `ldap` config to include checking for group membership, or attribute values rather than accepting any user with a valid password. In our environment that may more than we need, but we might want to consider using machine authentication rather than by user - see [Wired 802.1X on Linux](https://warlord0blog.wordpress.com/2019/07/10/wired-802-1x-on-linux/).

## References

https://github.com/FreeRADIUS/freeradius-server

https://hub.docker.com/r/freeradius/freeradius-server

https://gtacknowledge.extremenetworks.com/articles/How_To/How-to-Configure-PEAP-Authentication-via-OpenLDAP/

## IMPORTANT

> A major caveat to using OpenLDAP authentication via FreeRADIUS - When using Wifi with WPA-EAPS/PEAP authentication the password stored MUST be in plain-text!

The MSCHAPv2 authentication process requires that the password be converted to an NT-Password hash and the only way it can do that is if the stored password in in plain-text. This isn't such great news for user accounts, but can be mitigated by using device only accounts (`objectClass=device, objectClass=posixAccount`) that have no other access to the infrastructure and their only purpose is to authenticate a device.

Further mitigation by having the RADIUS and LDAP services within the same container set to minimise network traffic containing plain-text passwords.

From extremenetworks:

> Have the password encryption on the OpenLDAP server set to use clear text passwords. Then, in your LDAP configuration, set the User Authentication Type field to Plain Text Password Lookup and the User Password Attribute to userPassword (which is the default).
>
> Use an NT Hashed password. These encryption types are not supported by OpenLDAP for user passwords, so you must modify your user password update script or web page to set the password for the user, create the desired hash of the password, and set a newly defined attribute to have that value. With this method, the LDAP configuration must use the User Authentication Type of NTHash Password Lookup. You will also need to configure the User Password Attribute to be the attribute you selected for storing the NT Hash or LM Hash of the password.
>
> ExtremeNetworks
