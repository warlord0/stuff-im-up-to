---
pubDatetime: 2021-06-10T14:41:11Z
title: "USBGuard"
tags:
  - "Linux"
  - "Security"
description: "Whilst locking down some workstation with usbguard I wanted to gain more of an insight into what devices I wanted to block or allow. For simple data leakag"
---
Whilst locking down some workstation with usbguard I wanted to gain more of an insight into what devices I wanted to block or allow.

For simple data leakage prevention, there's only really two types I want to block, that's mass storage devices and Wi-Fi. No one should use these unless they are an authorised device. Reading the documentation the example seems a bit backwards to me, the example shows how to block everything but mass storage devices. The example shows how to block based on `with-interface` and a class id, but where do you find these class ids?

[https://www.usb.org/defined-class-codes](https://www.usb.org/defined-class-codes)

Now things make sense. I can add a series of default rules that only allow class IDs I want by updating the rules.

#### /etc/usbguard/rules.conf

```
allow with-interface one-of { 09:*:* }
allow with-interface one-of { 07:*:* }
allow with-interface one-of { 06:*:* }
allow with-interface one-of { 03:*:* }
allow with-interface one-of { 02:*:* }
allow with-interface one-of { 01:*:* }
allow with-interface one-of { 0b:*:* }
allow with-interface one-of { 0d:*:* }
allow with-interface one-of { 0e:*:* }
allow with-interface one-of { 10:*:* }
```

I omit anything with a class 08 (mass storage) and E0 (wireless) and restart usbguard.

```
sudo systemctl restart usbguard
```

When I plug in a memory stick, I can see it is blocked:

```
sudo usbguard list-devices

...
30: block id 0781:5408 serial "19424307CE1124AC" name "U3 Titanium" hash "fS9eKRZZPWSiLUyDypg9YepCXtwHYZEXP9GGYwsG6TM=" parent-hash "+B8+v40hqFWD2AApR0L4mLCQQG6rihTvdbvVV3Gc/j0=" via-port "1-9.2" with-interface 08:06:50 with-connect-type "unknown"
```

I can permanently unblock it using its ID number **30**, and it will get added into my rules.conf.

```
sudo usbguard allow-device -p 30
```
