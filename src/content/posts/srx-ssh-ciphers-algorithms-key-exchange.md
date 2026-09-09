---
pubDatetime: 2017-07-31T10:50:56Z
modDatetime: 2017-07-31T10:52:36Z
title: "SRX SSH Ciphers, Algorithms & Key Exchange"
tags:
  - "Networking"
  - "Security"
  - "ssh"
description: "When doing a Nessus scan for the first time on the new SRX320 cluster it highlighted some weaknesses in the SSH protocol. This was due to arcfour, cbc and hmac being enabled by default."
---
When doing a Nessus scan for the first time on the new SRX320 cluster it highlighted some weaknesses in the SSH protocol. This was due to arcfour, cbc and hmac being enabled by default. So to remedy this we need to set the acceptable levels of ciphers etc. Using the CLI a simple change to the config for the SSH service is required, under `system services ssh`.

    # edit system services ssh
    # set ciphers [ aes256-ctr "aes256-gcm@openssh.com" "chacha20-poly1305@openssh.com" ];
    # set macs [ hmac-sha2-256 "hmac-sha2-256-etm@openssh.com" hmac-sha2-512 "hmac-sha2-512-etm@openssh.com" ];
    # set key-exchange [ curve25519-sha256 ecdh-sha2-nistp256 ecdh-sha2-nistp384 ecdh-sha2-nistp521 group-exchange-sha2 ]

Commit the changes and rescan and all is good. Results from NMAP scan after making the changes:

    $ nmap --script ssh2-enum-algos 192.168.0.250 -p22

    Starting Nmap 7.40 ( https://nmap.org ) at 2017-07-31 11:23 BST
    Nmap scan report for srx10069.domain.local (192.168.0.250)
    Host is up (0.0016s latency).
    PORT STATE SERVICE
    22/tcp open ssh
    | ssh2-enum-algos: 
    | kex_algorithms: (5)
    | curve25519-sha256@libssh.org
    | ecdh-sha2-nistp256
    | ecdh-sha2-nistp384
    | ecdh-sha2-nistp521
    | diffie-hellman-group-exchange-sha256
    | server_host_key_algorithms: (4)
    | ssh-rsa
    | ssh-dss
    | ecdsa-sha2-nistp256
    | ssh-ed25519
    | encryption_algorithms: (3)
    | aes256-ctr
    | aes256-gcm@openssh.com
    | chacha20-poly1305@openssh.com
    | mac_algorithms: (4)
    | hmac-sha2-256
    | hmac-sha2-256-etm@openssh.com
    | hmac-sha2-512
    | hmac-sha2-512-etm@openssh.com
    | compression_algorithms: (2)
    | none
    |_ zlib@openssh.com

    Nmap done: 1 IP address (1 host up) scanned in 0.43 seconds
