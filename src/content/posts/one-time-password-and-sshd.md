---
pubDatetime: 2020-05-01T15:39:17Z
modDatetime: 2020-05-14T21:00:13Z
title: "One Time Password and SSHD"
tags:
  - "Linux"
  - "otp"
  - "Security"
  - "ssh"
description: "I made a bit of a fool of myself suggesting that we add a free means of securing our external SSH gateway by using Google Authenticator. My boss simply tur"
---
I made a bit of a fool of myself suggesting that we add a free means of securing our external SSH gateway by using Google Authenticator. My boss simply turned around and said

> "Why would we recommend that all our users get Google accounts just to logon to our services?"
>
> My Boss

It's because I haven't fully moved my mindset away from large commercial free but closed source services, into free and open source.

After five minutes I'd got [FreeOTP](https://freeotp.github.io/) installed on my phone and setup `libpam-oath` on my ssh server.

First install FreeOTP from the [F-Droid](https://f-droid.org/) store, or Google Play if you must.

Now install `libpam-oath` and some associated tools onto the ssh server.

```
$ sudo apt install libpam-oath oathtool qrencode
```

Generate a seed for your user:

```
$ head -10 /dev/urandom | sha512sum | cut -b 1-30
```

This gives us a long string of randomness like this `42d6a3f5a0ddfa225b65909a298bec` that we must use in our `/etc/users.oath` file, which we must create and assign appropriate permissions, eg.

#### /etc/users.oath

```
HOTP/T30/6 myuser - 42d6a3f5a0ddfa225b65909a298bec
```

```
$ sudo vi /etc/users.oath
$ sudo chmod 600 /etc/users.oath
$ sudo chown root /etc/users.oath
```

Configure PAM to use oath by adding this line in the top of the file `/etc/pam.d/sshd`. It's VERY important that this line is before the `@include common-auth`.

```
auth required pam_oath.so usersfile=/etc/users.oath window=30 digits=6
```

Edit the `/etc/ssh/sshd_config` to enable `ChallengeAuthentication`.

```
ChallengeAuthentication yes
UsePAM yes
AuthenticationMethods publickey,keyboard-interactive
PasswordAuthentication no
```

Make sure you restart your sshd service after these changes.

```
$ sudo systemctl restart sshd
```

> It's always a good idea to leave a terminal logged into a session with root privileges and do this work in another terminal. This way if you bork your PAM settings you still have an account logged in that will allow you to fix them.

## Setting Up FreeOTP

Now we need to get the QR code generated so we can use FreeOTP on our phone to generate the OTP. Use the random string we generated above to create the output we require:

```
$ oathtool -v -d6 42d6a3f5a0ddfa225b65909a298bec
Hex secret: 42d6a3f5a0ddfa225b65909a298bec
Base32 secret: ILLKH5NA3X5CEW3FSCNCTC7M
Digits: 6
Window size: 0
Start counter: 0x0 (0)
963058
```

We can use the Base32 secret to pass to our qrencode program to generate the qrcode - this even works on text consoles/terminals.

```
$ qrencode -t UTF8 'otpauth://totp/myuser@mymachine?secret=ILLKH5NA3X5CEW3FSCNCTC7M'
```

Now open FreeOTP and point your phone camera at the QR code to get the account added into your phone.

## Logging Into SSH

Now when you logon to your ssh server you should be prompted for the OTP you get from you FreeOTP.

```
$ ssh mymachine
One-time password (OATH) for `myuser':
```

That's it! We're now able to logon remotely with multi-factor authentication

## References

[https://wiki.archlinux.org/index.php/Pam_oath](https://wiki.archlinux.org/index.php/Pam_oath)

[http://www.nongnu.org/oath-toolkit/pam_oath.html](http://www.nongnu.org/oath-toolkit/pam_oath.html)
