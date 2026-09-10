---
pubDatetime: 2022-09-01T15:16:52Z
modDatetime: 2022-09-02T14:30:41Z
title: "OpenVPN MFA and PAM"
tags:
  - "Linux"
  - "Networking"
  - "openvpn"
  - "Security"
heroImage: "/blog-media/2016/09/openvpntech_logo1.png"
description: "So far I've seen 2FA/MFA with OpenVPN using a 3rd Party plugin openvpn-otp.so from evgeny-gridasov/openvpn-otp , but after I got it working I didn't like t"
---
So far I've seen 2FA/MFA with OpenVPN using a 3rd Party plugin `openvpn-otp.so` from [evgeny-gridasov/openvpn-otp](https://github.com/evgeny-gridasov/openvpn-otp), but after I got it working I didn't like the way it implemented HOTP counter storage and the use of `otp-secrets`. There has to be another way.

I see that there is a native `openvpn-plugin-auth-pam.so`, and also know that on another system we're using the [OATH toolkit](https://www.nongnu.org/oath-toolkit/index.html) for providing OTP for [sshd](https://warlord0blog.wordpress.com/2020/05/01/one-time-password-and-sshd/). The OATH toolkit includes `pam_oath.so`. This means there is a common link for me to make use of PAM to give me MFA for OpenVPN.

## Server Configuration

As I already have a configured [OpenVPN](https://warlord0blog.wordpress.com/tag/openvpn/) server, configured with LDAP auth, all I need to install `oathtool`, `qrencode` and `libpam-oath`.

```
sudo apt install oathtool qrencode libpam-oath
```

Create a file for my OTP users `/etc/users.oath` and set it, so only nobody can read it.

```
touch /etc/users.oath
chown nobody: /etc/users.oath
```

Create an OTP secret using something that will give you a sha1 hash, eg.

```
openssl rand -hex 64 | sha1sum | cut -d' ' -f1
```

Copy the hash and then edit the `/etc/users.oath` file, so it includes your user's id and the hash we copied, eg.

```
#type      username  pin secret-hash
HOTP/T30/6 user.name  -  6776deedd82c054d86cc87bc44324318c4334967
```

Create `/etc/pam.d/openvpn`, owned and writable only by root, readable by all. It only has one line in it.

```
auth requisite pam_oath.so usersfile=/etc/users.oath window=30 digits=6
```

Add the plugin to the OpenVPN `server.conf` file.

```
plugin /usr/lib/openvpn/openvpn-plugin-auth-pam.so "/etc/pam.d/openvpn login USERNAME password PASSWORD One-time OTP"
```

For this to work, PAM must be able to look up a user by name/id. If it can’t do this, you will get errors in the log that look like this:

```
client openvpn: pam_unix(openvpn:account): could not identify user (from getpwnam(user.name))
```

This means that you must install and configure the LDAP client for PAM. You must be able to use `id user.name` in order for the PAM module to work. Even though the OpenVPN plugin for LDAP does not require PAM to succeed, the `pam_oath.so` must be able to find the user.

Make sure you restart OpenVPN after these changes.

```
sudo systemctl restart openvpn@server
```

## User Token Generation

To get the token generation onto a device like FreeOTP or Google Authenticator, you need to get the secret as a base32 hash. The easiest way to do it is to use `oathtool` to generate a token with verbose mode, eg.

```
$ oathtool --totp -v 6776deedd82c054d86cc87bc44324318c4334967
Hex secret: 6776deedd82c054d86cc87bc44324318c4334967
Base32 secret: M53N53OYFQCU3BWMQ66EIMSDDDCDGSLH
Digits: 6
Window size: 0
TOTP mode: SHA1
Step size (seconds): 30
Start time: 1970-01-01 00:00:00 UTC (0)
Current time: 2022-09-01 14:29:49 UTC (1662042589)
Counter: 0x34D5BCB (55401419)

506918
```

You can then just copy the base32 secret and add it to the string as below, to generate a QR code with.

```
qrencode -t UTF8 'otpauth://totp/openvpn:user.name?secret=M53N53OYFQCU3BWMQ66EIMSDDDCDGSLH'
```

Using UTF8 creates a QR code on a terminal you can scan immediately. You can also use PNG and direct the output to a file you can send to the user to scan into FreeOTP, etc.

```
qrencode -t PNG 'otpauth://totp/openvpn:user.name?secret=M53N53OYFQCU3BWMQ66EIMSDDDCDGSLH' -o user.name.png
```

### server.conf

PAM responds to prompts that are returned by the `pam_oath.so` plugin.

The parameters are to use the openvpn pam.d file, and respond to a `login` prompt with the `USERNAME`, a `password` prompt (not used) with the `PASSWORD`, and, the final bit of magic that makes it work, a `One-time` prompt with the `OTP`.

The prompt in the debug log can be seen as:

```
2022-09-01 11:41:07 us=982761 PLUGIN AUTH-PAM: BACKGROUND: name match found, query/match-string ['One-time password (OATH) for `user.name': ', 'One-time'] = 'OTP'
```

PAM uses the `One-time` as a match to the actual prompt `One-time password (OATH) for 'user.name':` and sends it the `OTP`.

This is what my `server.conf` ends up looking like:

```
proto udp
port 1194
dev tun0
server 192.168.255.0 255.255.255.0
topology subnet

verb 2

user nobody
group nogroup

tls-server
ca /etc/openvpn/pki/ca.crt
cert /etc/openvpn/pki/issued/server.crt
crl-verify /etc/openvpn/crl.pem
# dh /etc/openvpn/pki/dh.pem
dh none
key /etc/openvpn/pki/private/server.key
key-direction 0
tls-auth /etc/openvpn/pki/ta.key

status /var/log/openvpn/openvpn-status.log
log /var/log/openvpn/openvpn.log

push "route 10.0.0.0 255.255.255.0"
push "route 128.0.0.0 128.0.0.0"
push "redirect-gateway def1 block-local"
push "dhcp-option DNS 10.0.0.254"
push "comp-lzo no"

plugin /usr/lib/openvpn/openvpn-auth-ldap.so /etc/openvpn/server/auth/auth-ldap.conf

auth-gen-token 43200
auth-nocache
client-config-dir ccd
comp-lzo no
float
keepalive 10 60
#opt-verify
persist-key
persist-tun

cipher AES-256-GCM
ecdh-curve secp384r1
ncp-disable
remote-cert-tls client
tls-cert-profile preferred
tls-cipher TLS-ECDHE-ECDSA-WITH-CHACHA20-POLY1305-SHA256:TLS-ECDHE-RSA-WITH-CHACHA20-POLY1305-SHA256:TLS-ECDHE-ECDSA-WITH-AES-128-GCM-SHA256:TLS-ECDHE-RSA-WITH-AES-128-GCM-SHA256
tls-ciphersuites TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256
tls-version-min 1.2
verify-client-cert require
plugin /usr/lib/openvpn/openvpn-plugin-auth-pam.so "/etc/pam.d/openvpn login USERNAME password PASSWORD One-time OTP"
```

> It’s also worth noting that this is a TOTP (Time Based One Time Password) not HOTP (HMAC based One Time Password). This means that the `user.auth` file is not being used to store HOTP counters.

## References

[https://blog.securityevaluators.com/hardening-openvpn-in-2020-1672c3c4135a](https://blog.securityevaluators.com/hardening-openvpn-in-2020-1672c3c4135a)

Known issue with using `--opt-verify` [https://forums.openvpn.net/viewtopic.php?t=29557](https://forums.openvpn.net/viewtopic.php?t=29557)
