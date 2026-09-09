---
pubDatetime: 2020-05-04T15:55:44Z
title: "Yubikey and Ubuntu"
draft: true
tags:
  - "Uncategorized"
description: "I've ordered a Yubikey to setup MFA on some of my remote services. IT's going to need some things setting up on my client for it to work. I want it to be u"
---
I've ordered a Yubikey to setup MFA on some of my remote services. IT's going to need some things setting up on my client for it to work.

I want it to be used with OpenPGP so using the `gpg` tools to get it going looks like it needs the SmartCard daemon `scdaemon`.

```
$ sudo apt install scdaemon
$ gpg2 --card-status
Reader ………..: 1050:0407:X:0
Application ID …: D2760001260103050006124404910000
Application type .: OpenPGP
Version ……….: 3.4
Manufacturer …..: Yubico
Serial number ….: 19060491
Name of cardholder: [not set]
Language prefs …: [not set]
Salutation …….:
URL of public key : [not set]
Login data …….: [not set]
Signature PIN ….: not forced
Key attributes …: rsa2048 rsa2048 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 0 3
Signature counter : 0
KDF setting ……: off
Signature key ….: [none]
Encryption key….: [none]
Authentication key: [none]
General key info..: [none]
```

The the wheels started to come off. Following some guidance on the method of adding gpg keys to the Yubikey pointed out that my rsa/4096 keys wont fit as the above shows they're expected to be rsa/2048.

I need to resize the key attributes. To do that I need to use `gpg2`.

```
$ gpg2 --card-edit
gpg/card> admin
Admin commands are allowed

gpg/card> key-attr
Changing card key attribute for: Signature key
Please select what kind of key you want:
(1) RSA
(2) ECC
Your selection? 1
What keysize do you want? (4096)
```

And repeat for all 3 keys Signature, Encryption and Authentication. You will probably be asked for your admin PIN to do this. If you haven't changed it then the defaults are:

> PIN: 123456 Admin\
> PIN: 12345678

Also, don't worry about bricking the Yubikey. If you get PIN's wrong they will become blocked, but the key can always be factory reset - you'll loose your keys from it, but at this stage we're just setting it up anyway. Recreating keys isn't an issue right now, because we haven't used them.

## Resetting the Yubikey

```
$ ykman openpgp reset
WARNING! This will delete all stored OpenPGP keys and data and restore factory settings? [y/N]: y
Resetting OpenPGP data, don't remove your YubiKey…
Success! All data has been cleared and default PINs are set.
PIN: 123456
Reset code: NOT SET
Admin PIN: 12345678
```
