---
pubDatetime: 2017-03-03T09:32:09Z
modDatetime: 2017-03-03T13:47:36Z
title: "OpenVPN Create User Keys"
tags:
  - "Linux"
  - "Networking"
  - "openvpn"
description: "As I'd forgotten how to create a new OpenVPN user, it's not something I do every day, I thought I put here a reminder of the process used. To get a private"
---
As I'd forgotten how to create a new OpenVPN user, it's not something I do every day, I thought I put here a reminder of the process used. To get a private key and a signed public key the easiest way is to use the Easy-RSA program that came with openvpn. Change to the directory, set the variables and run the script like this:

    $ cd /etc/openvpn/easy-rsa
    $ sudo source ./vars
    $ sudo ./build-key-pass [USERNAME]

This creates the necessary CSR and submits it and generates the key and certificate in `/etc/openvpn/easy-rsa/keys` I then wrote a script than turns the key and certificate into a single .ovpn file I can just give to the user along with the key password.

### makeovpn.sh

    #!/bin/sh

    if [ -z "$1" ]; then
            echo "Usage: makeovpn.sh [username]"
    fi

    if [ -f /etc/openvpn/easy-rsa/keys/$1.crt ]; then
            cat ~/base.ovpn > /etc/openvpn/easy-rsa/keys/$1.ovpn
            echo \<cert\> >> /etc/openvpn/easy-rsa/keys/$1.ovpn
            cat /etc/openvpn/easy-rsa/keys/$1.crt >> /etc/openvpn/easy-rsa/keys/$1.ovpn
            echo \<\/cert\> >> /etc/openvpn/easy-rsa/keys/$1.ovpn
            echo \<key\> >> /etc/openvpn/easy-rsa/keys/$1.ovpn
            cat /etc/openvpn/easy-rsa/keys/$1.key >> /etc/openvpn/easy-rsa/keys/$1.ovpn
            echo \<\/key\> >> /etc/openvpn/easy-rsa/keys/$1.ovpn
    fi

This takes the base.ovpn file I created (below) and adds into it the key and certificate and places it in the same keys folder.

### base.ovpn

    dev tun
    client
    auth-user-pass

    remote 192.168.53.132 443 tcp
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
    MIIFITCCBAmgAwIBAgIJAJRzmq16zaFQMA0GCSqGSIb3DQEBCwUAMIG7MQswCQYD
    ...
    VQQGEwJHQjEXMBUGA1UECBMOTGVpY2VzdGVyc2hpcmUxFTATBgNVBAcTDExvdWdo
    ZjRwzA8b59q4gFpEKgRHeGkGcTc5
    -----END CERTIFICATE-----
    </ca>
    <tls-auth>
    #
    # 2048 bit OpenVPN static key
    #
    -----BEGIN OpenVPN Static key V1-----
    7a4d056278431edfe2c4b91270ad365b
    8fe44cfad204cdeaa539b1d505e87f02
    ...
    92bcb834e527fdbd9356602d76d3c64e
    -----END OpenVPN Static key V1-----
    </tls-auth>

Replace the remote IP address, CA and TLS-AUTH sections with your own external IP, CA certificate and DH key.
