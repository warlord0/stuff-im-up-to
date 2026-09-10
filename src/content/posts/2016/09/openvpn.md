---
pubDatetime: 2016-09-19T14:46:18Z
modDatetime: 2016-09-19T14:54:57Z
title: "OpenVPN"
tags:
  - "firewall"
  - "Networking"
  - "openvpn"
  - "vpn"
heroImage: "/blog-media/2016/09/openvpntech_logo1.png"
description: "Some months ago we bought a Barracuda firewall/VPN box to allow IT staff to connect and manage other IT devices securely. The idea was that the Barracuda would not only authenticate them against Active Directory and support two-factor authentication, but also carry out some Network Access Control and only allow devices that meets specific criteria connect to the network. Eg. Must be a domain member with a current Anti-virus and active firewall."
---
Some months ago we bought a Barracuda firewall/VPN box to allow IT staff to connect and manage other IT devices securely. The idea was that the Barracuda would not only authenticate them against Active Directory and support two-factor authentication, but also carry out some Network Access Control and only allow devices that meets specific criteria connect to the network. Eg. Must be a domain member with a current Anti-virus and active firewall. Well it turns out that the Barracuda couldn't meet these needs. If you wanted to connect to the Barracuda using it's web interface for portal type access it was fine. It used an agent based NAC and would allow two-factor auth using Google, but sadly not RADIUS. However, if you wanted to use the network connection feature that is provided by using OpenVPN then you were going to be sadly disappointed. Admittedly we are looking at the budget end of the market, sub £1,000. It need only support five concurrent users as it's pretty much a get out of jail free card should the tasks you need to carry out be more than can be allowed through a remote desktop in a walled garden setup. So the Barracuda went back and it left me thinking I can build my own based on the fact that [OpenVPN](https://openvpn.net/index.php/open-source.html) is Open Source. So that's exactly what I did. It took a little bit of thinking about, but eventually we ended up with a solution that works across client platforms and although we sacrificed some of our goals, namely RADIUS auth and NAC, we got a two-factor solution that authenticates with certificates and Active Directory. A user must be issued with a certificate, that certificate can have a password on it - which by default does. They also must be within a specific AD OU. The server is configured to proxy port 443/tcp so should play fairly nicely with outside connections. It's also hooked in with [fail2ban](http://www.fail2ban.org) so anyone hammering will get the boot. Key configuration points within **server.conf**:

    dev tun
    proto tcpport 443
    port-share 127.0.0.1 5545

    user nobody
    group nogroup

    cipher AES-256-CBC
    auth SHA512
    keysize 256

    ca /usr/local/etc/ssl/ca.pem
    cert /etc/openvpn/keys/server.crt
    key /etc/openvpn/keys/server.key
    tls-auth /etc/openvpn/keys/tls-auth.key 0

    server 10.9.8.0 255.255.255.0
    topology subnet
    ifconfig-pool-persist ipp.txt
    push "route 192.168.0.0 255.255.255.0"
    push "redirect-gateway def1"
    push "dhcp-option DOMAIN mydomain.local"
    push "dhcp-option DNS 192.168.0.5"
    push "dhcp-option DNS 192.168.0.10"
    push "dhcp-option NTP 192.168.0.5"
    push "dhcp-option DISABLE-NBT"

    keepalive 10 120

    comp-lzo
    persist-key
    persist-tun

    status /var/log/openvpn-status.log
    log /var/log/openvpn.log

    verb 3
    #client-to-client

    plugin /usr/lib/openvpn/openvpn-auth-ldap.so /etc/openvpn/auth/auth-ldap.conf
    #client-cert-not-required

I've shown the options I don't want commented out, namely the client-to-client and client-cert-not-required, because we don't want clients seeing each other and we must have a client certificate. The port share of 5545 isn't a service that exists. I don't really want to provide anything that looks like a web server on that port, although I could happily set Nginx up with a static page and present something. This also needs to link to the **auth/auth-ldap.conf**:

    <LDAP>
            # LDAP server URL
            URL             ldaps://ldapserver

            # Bind DN (If your LDAP server doesn't support anonymous binds)
            BindDN          "CN=Read Only,CN=Users,DC=mydomain,DC=local"

            # Bind Password
            Password      SecretPassword

            # Network timeout (in seconds)
            Timeout         15

            # Enable Start TLS
            TLSEnable       yes

            # Follow LDAP Referrals (anonymously)
            FollowReferrals yes

            # TLS CA Certificate File
            TLSCACertFile   /usr/local/etc/ssl/ca.pem
            # TLS CA Certificate Directory
            TLSCACertDir    /etc/ssl/certs

            # Client Certificate and key
            # If TLS client authentication is required
            TLSCertFile     /usr/local/etc/ssl/client-cert.pem
            TLSKeyFile      /usr/local/etc/ssl/client-key.pem

            # Cipher Suite
            # The defaults are usually fine here
            # TLSCipherSuite        ALL:!ADH:@STRENGTH
    </LDAP>

    <Authorization>
            # Base DN
            BaseDN          "OU=Admin Accounts,DC=mydomain,DC=local"

            # User Search Filter
            SearchFilter    "(sAMAccountName=%u)"

            # Require Group Membership
            RequireGroup    false
    </Authorization>

Then to make things easier for the client I package the certificates into their client.ovpn config file. This way all they are given is one file they stick on their client machine in the 'config' folder. Example **client.ovpn**:

    dev tun
    client
    auth-user-pass

    remote [EXTERNAL IP OF SERVER] 443 tcp
    nobind

    cipher AES-256-CBC
    auth SHA512
    keysize 256

    remote-cert-tls server
    key-direction 1

    comp-lzo
    persist-key
    persist-tun

    verb 3
    <ca>
    -----BEGIN CERTIFICATE-----
    ...
    -----END CERTIFICATE-----
    </ca>
    <tls-auth>
    #
    # 2048 bit OpenVPN static key
    #
    -----BEGIN OpenVPN Static key V1-----
    ...
    -----END OpenVPN Static key V1-----
    </tls-auth>
    <cert>
    -----BEGIN CERTIFICATE-----
    ...
    -----END CERTIFICATE-----
    </cert>
    <key>
    -----BEGIN ENCRYPTED PRIVATE KEY-----
    ...
    -----END ENCRYPTED PRIVATE KEY-----
    </key>

I've obviously trimmed out the certs and keys to protect the innocent. Notice the key-direction is 1 and the server is 0. Doesn’t matter which way round they go, but they have to be different.
