---
pubDatetime: 2022-09-02T05:20:00Z
modDatetime: 2022-09-01T18:26:51Z
title: "OpenVPN Client in the Background"
tags:
  - "Linux"
  - "Networking"
  - "openvpn"
heroImage: "/blog-media/2016/09/openvpntech_logo1.png"
description: "With 2FA/MFA and OpenVPN on Linux you need to use the terminal to start up the session. sudo openvpn user.name.ovpn You then get to see all the prompts for"
---
With 2FA/MFA and OpenVPN on Linux you need to use the terminal to start up the session.

```
sudo openvpn user.name.ovpn
```

You then get to see all the prompts for username, password, OTP and certificate key passphrase. The only trouble is you get to see it in a terminal all day and you can't close it.

Run it inside a `screen` session instead!

```
screen -dmS vpn
screen -x vpn
sudo openvpn user.name.ovpn
```

Then CTRL+A+D to detach yourself. You can close the terminal and come back to it inside any new terminal using:

```
screen -x vpn
```
