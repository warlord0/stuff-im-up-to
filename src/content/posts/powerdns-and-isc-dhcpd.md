---
pubDatetime: 2020-09-08T09:28:13Z
modDatetime: 2020-09-08T13:40:06Z
title: "PowerDNS and ISC DHCPD"
tags:
  - "dhcp"
  - "dns"
  - "Linux"
  - "Networking"
description: "As we host lots of sites we have lot's of DNS. Currently it's a database driven old version of ISC BIND. There are certain tasks we need to do manually to"
---
As we host lots of sites we have lot's of DNS. Currently it's a database driven old version of ISC BIND. There are certain tasks we need to do manually to add records like SPF and TXT and there is no dynamic update. Our main aims are to have a easier means of our support staff updating domains with all the modern records for DMARC and DKIM, but also lets us use dynamic entries to help with the Let's Encrypt certificate creation process.

We have a strategy that all our deployments begin as virtual first to keep things as mobile and as resilient as possible. This means Docker or KVM, before we look to deploying natively. This solution is going to be within a Docker container set.

The `psitrax/powerdns` docker image seems mature with a strong following. I'm going to add PowerDNS admin to that from `ngoduykhanh/powerdns-admin`, and then add in `networkboot/dhcpd` for my dhcpd.

For the PowerDNS storage back-end we'll use PostgreSQL. We can swarm this eventually and add in replication. Our domain transfers will be done via the PostgreSQL WAL shipping replication method rather than the DNS AXFR.

*Replace the `domain.tld` with your own domain in all of these notes.*

```
version: '3.2'

services:
  powerdns:
    image: ${POWERDNS_IMAGE:-psitrax/powerdns}:${POWERDNS_IMAGE_VERSION:-latest}
    environment:
      MYSQL_AUTOCONF: 'false'
    volumes:
      - "${PWD}/conf.d:/etc/pdns/conf.d:rw"
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/pg_socket:/var/run/postgresql/:rw"
    ports:
      - "53:53"
      - "53:53/udp"
    command:
      - "--cache-ttl=120"
      - "--webserver=yes"
      - "--webserver-address=0.0.0.0"
      - "--webserver-port=8081"
      - "--webserver-allow-from=0.0.0.0/0"
      - "--api=yes"
      - "--api-key=${API_KEY?REQUIRED}"
      - "--launch=gpgsql"
      - "--gpgsql-host=db"
      - "--gpgsql-dbname=pdns"
      - "--gpgsql-user=${POSTGRES_PDNS_USER:-powerdns}"
      - "--gpgsql-password=${POSTGRES_PDNS_PASSWORD?REQUIRED}"
      - "--gpgsql-dnssec=yes"
      - "--dnsupdate=yes"
      - "--allow-dnsupdate-from=0.0.0.0/0"
      - "--default-soa-name=ns0.domain.tld."
      - "--default-soa-mail=hostmaster.domain.tld."
    depends_on:
      - db

  db:
    hostname: db
    image: ${POSTGRES_IMAGE:-postgres}:${POSTGRES_IMAGE_VERSION:-12.2-alpine}
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD?REQUIRED}
      POSTGRES_PDNS_USER: ${POSTGRES_PDNS_USER:-powerdns}
      POSTGRES_PDNS_PASSWORD: ${POSTGRES_PDNS_PASSWORD?REQUIRED}
    volumes:
      - "${PWD}/initdb.sh:/docker-entrypoint-initdb.d/initdb.sh"
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/postgres:/var/lib/postgresql/data:rw"
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/pg_socket:/var/run/postgresql/:rw"

  admin:
    image: ${PDNS_ADMIN_IMAGE:-ngoduykhanh/powerdns-admin}:${PDNS_ADMIN_IMAGE_VERSION:-latest}
    ports:
      - "127.0.0.1:${PORTBASE?REQUIRED}80:80"
    logging:
      driver: json-file
      options:
        max-size: 50m
    environment:
      SQLALCHEMY_DATABASE_URI: 'postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD?REQUIRED}@db:5432/pdns'
      GUINCORN_TIMEOUT: 60
      GUNICORN_WORKERS: 2
      GUNICORN_LOGLEVEL: DEBUG
    depends_on:
      - powerdns
      - db
    restart:
      always

  dhcpd:
    image: ${DHCPD_IMAGE:-networkboot/dhcpd}:${DHCPD_IMAGE_VERSION:-latest}
    volumes:
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/dhcpd:/data:rw"
    restart:
      on-failure
    network_mode: host
    command: [ "enp7s0" ]
```

Gitlab snippet [initdb.sh](https://gitlab.com/-/snippets/2012848) - You may need to get an updated schema from <https://doc.powerdns.com/authoritative/backends/generic-postgresql.html>. If you do then edit the `init.db.sh` file and paste the schema into the second psql section.

Then our `.env` looks like this:

```
SERIAL=powerdns
PORTBASE=100
CONTAINER_VOLUMES=/srv/container-volumes

API_KEY=MySuperSecretKey
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SecretKey
POSTGRES_PDNS_PASSWORD=MyOtherSecretKey
```

I'm going to be running the admin behind an Nginx reverse proxy so only listening on localhost for that. When you first go to logon to the admin GUI you just need to choose create account. This will make you the first user and you'll become the admin.

What I really like about PowerDNS is that it is straight forward GUI but also support OpenIDC/OAuth2 for authentication. So once I've logged in I can reconfigure it so that it doesn't use it's own user table and won't allow registration and will only accept users from the Keycloak server we use for central authentication.

Bring up only the containers I need for now:

```
docker-compose up -d admin 
```

Admin will bring up the dependencies `powerdns` and `db`, but leave `dhcpd` down for now.

Once up and running PowerDNS with the admin GUI is pretty straight forward. we have an authoritative server for whatever domain we wish to create and can add modern features like DNSSEC with the click of a button.

What's really nice is the ability to use it as a customer tool, allowing the customer to logon and make changes to their own domain! We're not going that far, but the potential is there.

## Create Your Domain

You'll want to create both a forward and reverse domain in the GUI. Add the forward domain is easy enough, click Add Domain and give it your domain name `domain.tld`. The reverse is the same process, but the domain name is in the form `0.5.10.in-addr.arpa` where the numerals are the first three numbers in your domain IP address (eg. 10.5.0.0) in reverse order.

As we want to use this internally for our name resolution I want to get it paired with ISC DHCPD. This way our dynamic clients can get an IP address and register within the DNS service too.

For this we need to create a secure key and enable updates from the DHCPD service.

## Create the TSIG Key

Once you've created your domain in the GUI you'll need to use the command line to create the security key.

```
docker-compose exec powerdns pdnsutil generate-tsig-key dhcp-key hmac-sha256
```

You'll want this generated key later to configure DHCPD.

Add the key to the domain forward and reverse:

```
docker-compose exec powerdns pdnsutil activate-tsig-key domain.tld dhcp-key master
docker-compose exec powerdns pdnsutil activate-tsig-key 0.5.10.in-addr.arpa dhcp-key master
```

Check the keys and domains with:

```
docker-compose exec powerdns pdnsutil list-tsig-keys
docker-compose exec powerdns pdnsutil show-zone domain.tld
docker-compose exec powerdns pdnsutil show-zone 0.5.10.in-addr.arpa
```

## Configure DHCPD

Edit the `dhcpd.conf` file and you should minimally have one that looks like this:

```
authoritative;
default-lease-time 720000;
max-lease-time 2160000;
ping-check true;
update-static-leases on;

ddns-updates on;
ddns-update-style standard;
ddns-ttl 300;
ddns-domainname "domain.tld";
ddns-rev-domainname "in-addr.arpa";

# Add the TSIG key generated with pdnsutil
key "dhcp-key" {
        algorithm hmac-sha256;
        secret "sb159LD2PNi2rnJRQCMF7ShjDwN/IukYZA78AEfSs9as3yliawW9q2QlQpusxAjeurNB2/FVFR3h2Pt5+2fdag==";
};

# Specify the zone name and the DNS server
zone domain.tld {
        primary 192.168.122.183;
        key dhcp-key;
}

zone 0.5.10.in-addr.arpa {
        primary 192.168.122.183;
        key dhcp-key;
}

#-------------------------------
# Network Scope
#-------------------------------
subnet 10.5.0.0 netmask 255.255.255.0 {
        option domain-name-servers 192.168.122.183;
        option domain-search "domain.tld";
    option domain-name "domain.tld";
        option routers 10.5.0.1;

        pool {
            range 10.5.0.50 10.5.0.199;
        }
}
```

Notice the lines in the group with `ddns-updates`, this tells DHCPD what to use to update both forward and reverse domains.

Following that we have the `dhcp-key` that we needed to copy from the above `pdnsutil` generation.

Next we have the `zone` sections. These are what to update, where and what key to use.

Then we move onto the network scopes, the subnet for our network is going to be 10.5.0.0/24. I've added in all the options I need for this to get started.

Now whatever interface you are connecting to this subnet for DHCPD must have an IP address in the specified subnet. If it does not then DHCPD will fail to start with an error something like:

> No subnet declaration for enp7s0 (no IPv4 addresses).\
> \*\* Ignoring requests on enp7s0. If this is not what\
> you want, please write a subnet declaration\
> in your dhcpd.conf file for the network segment\
> to which interface enp7s0 is attached. \*\*

Eg.

```
$ ip addr show dev enp7s0 
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:3c:eb:97 brd ff:ff:ff:ff:ff:ff
    inet 10.5.0.1/24 scope global enp7s0
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe3c:eb97/64 scope link 
       valid_lft forever preferred_lft forever
```

The starting config of DHCPD needs us to specify an interface to listen on. You'll find this in the `docker-compose.yml` as an array for the command, eg.

```
    command: [ "enp7s0" ]
```

You can add more to it using the format:

```
    command: [ "enp7s0", "enp8s0" ]
```

It's worth pointing out that the `dhcpd` container is going to use the `network_mode: host`. This is so it has full access to the host interfaces to deliver DHCP on. It's also worth understanding that you could easily separate `dhcpd` into it's own container set as it is not making any reliance upon `powerdns`. It will just fail to carry out DNS updates if `powerdns` is unavailable.

Now it's time to bring up `dhcpd`.

```
docker-compose up -d dhcpd
```

If everything went well your logs should look like this:

```
dhcpd_1     | Internet Systems Consortium DHCP Server 4.3.5
dhcpd_1     | Copyright 2004-2016 Internet Systems Consortium.
dhcpd_1     | All rights reserved.
dhcpd_1     | For info, please visit https://www.isc.org/software/dhcp/
dhcpd_1     | Config file: /data/dhcpd.conf
dhcpd_1     | Database file: /data/dhcpd.leases
dhcpd_1     | PID file: /var/run/dhcpd.pid
dhcpd_1     | Wrote 0 leases to leases file.
dhcpd_1     | Listening on LPF/enp7s0/52:54:00:3c:eb:97/10.5.0.0/24
dhcpd_1     | Sending on   LPF/enp7s0/52:54:00:3c:eb:97/10.5.0.0/24
dhcpd_1     | Sending on   Socket/fallback/fallback-net
dhcpd_1     | Server starting service.
```

Then you should see DHCP requests and updates happening:

```
dhcpd_1     | DHCPREQUEST for 10.5.0.50 from 52:54:00:36:2d:92 via enp7s0
dhcpd_1     | DHCPACK on 10.5.0.50 to 52:54:00:36:2d:92 (client1) via enp7s0
dhcpd_1     | Added new forward map from domain.tld to 10.5.0.50
dhcpd_1     | Added reverse map from 50.0.5.10.in-addr.arpa to domain.tld
```

## Setting Up certbot

Install certbot and the [rfc2136](https://tools.ietf.org/html/rfc2136) plugin - this is what is used to add the acme-challenge record to the DNS service.

```
sudo apt install python3-certbot-dns-rfc2136 certbot
```

Register a new TSIG key to allow certbot to update the domains you want.

```
docker-compose exec powerdns pdnsutil generate-tsig-key certbot-key hmac-sha256 
docker-compose exec powerdns pdnsutil activate-tsig-key domain.tld certbot-key master
```

Create a `certbot.ini` file for the credentials to go into. This should be owned by root and only readable by root too. Best to put it into a safe location like `/etc`.

```
dns_rfc2136_server = 192.168.122.183

dns_rfc2136_port = 53

dns_rfc2136_name = certbot-key

dns_rfc2136_secret = /1ZB+h7f97nhDLVFfVl4vzpp7VHe9eptV6Lx1nplBtz2HuqwDrdzXcZdP/4V5NcwsKjmuysJv0a3u5PE3PdWPA==

dns_rfc2136_algorithm = HMAC-SHA256
```

Pay attention to the algorithm we used when we created the key.

Now we can create the request for a new certificate like:

```
sudo certbot certonly --dns-rfc2136 --dns-rfc2136-credentials /etc/certbot.ini -d spade.domain.tld --dry-run -v
```

This will, or should, create a TXT record in your domain for the acme-challenge - you can see it in the admin GUI. Don't worry if it fails right now - in fact it is probably best that it does. The record will exist for up to 60 seconds whilst certbot waits for a response from Let's Encrypt. If it works straight away you may not even see the TXT record.

Our next step from here would probably be to introduce the PowerDNS [`recursor`](https://www.powerdns.com/recursor.html) for making DNS queries without requiring forwarders - using root hints and by passing all those sniffing DNS services like Google from the chain.

## Refrences

[https://medium.com/@carll/get-up-and-running-on-with-your-own-dns-and-dhcp-server-from-scratch-powerdns-isc-dhcp-server-4b9d6185d275](https://medium.com/@carll/get-up-and-running-on-with-your-own-dns-and-dhcp-server-from-scratch-powerdns-isc-dhcp-server-4b9d6185d275)
