---
pubDatetime: 2023-10-04T20:53:05Z
title: "WebAuthn and Yubikey"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2018/10/computer-code.jpg"
description: "I've had a Yubikey 5 NFC for a while, and it's pretty much sat doing nothing. Today I dusted it off and got it setup. Seems the FIDO U2F is interchangeable"
---
I've had a Yubikey 5 NFC for a while, and it's pretty much sat doing nothing. Today I dusted it off and got it setup.

> Seems the FIDO U2F is interchangeable with WebAuthn - may not be strictly true, but as far as the Yubikey goes, when I wipe the FIDO U2F PIN I lose the WebAuthn PIN too, and had to re-register the key with other services like [github.com](http://github.com)

I wanted to set it up for my calls to `sudo`. In hindsight, not the smartest test. If you bork your PAM/sudo settings, then you better have a working `root` account to fix it with.

Install the necessary packages.

```
pamac install autoconf automake libtool pkg-config libfido2 pam-u2f
```

#### /etc/pam.d/sudo

Added the following to the top of my sudo file.

```
auth sufficient pam_u2f.so cue [cue_prompt=Tap your Yubikey]
```

Create a config folder and grab the U2F from the key into a file.

```
mkdir ~/.config/Yubico
pamu2fcfg > ~/.config/Yubico/u2f_keys
```

Now when I call `sudo` I get asked to "Tap your Yubikey", and I can continue into `sudo`.

Make sure you don't have a `NOPASSWD:` in `sudoers` that matches your user/group, or you won't get the prompt.

My `/etc/pam.d/sudo` looks like this, as I also have a fingerprint reader.

```
#%PAM-1.0

auth sufficient pam_u2f.so cue [cue_prompt=Tap your Yubikey]

auth required pam_env.so
auth sufficient pam_fprintd.so
auth sufficient pam_unix.so try_first_pass likeauth nullok
auth required pam_deny.so
auth        include     system-auth
account     include     system-auth
session     include     system-auth
```

If I don't have the Yubikey plugged in, I get asked for my fingerprint instead. If I CTRL+C the fingerprint, I get asked for a password. Works well in my environment.

I went on to test at [webauthn.io](https://webauthn.io) and that's when it asked me to put a PIN on my key. After I did that, my Yubikey stopped working for `sudo`. It was a simple fix, just run`pamu2fcdfg` again - and put in the PIN when asked.

```
pamu2fcfg > ~/.config/Yubico/u2f_keys
```
