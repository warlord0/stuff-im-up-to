---
pubDatetime: 2023-11-10T14:44:49Z
title: "Using WireGuard as a non-Administrator on Windows"
tags:
  - "Windows"
  - "wireguard"
heroImage: "/blog-media/2020/04/wireguard.png"
description: "WireGuard does not work on Windows unless you are an administrator. However, you can enable a regular user to control the service after an admin has instal"
---
WireGuard does not work on Windows unless you are an administrator. However, you can enable a regular user to control the service after an admin has installed and configured it. You cannot use the standard WireGuard GUI at all, and should follow these steps to give a non-admin user the ability to start and stop the WireGuard connection service.

First off, install WireGuard onto the Windows PC as an administrator, or elevated permissions to do so.

Start an Administrative command prompt as we need to run a few commands with elevated permissions.

Copy the WireGuard config file (`wg0.conf`) into `“C:\Program Files\WireGuard\Data\Configurations\wg0.conf”`. The WireGuard Management service should convert this to an encrypted version with a `.dpapi` extension, eg. `wg0.conf.dpapi`

Add the `wg0.conf` as a service using:

```
wireguard /installservice “C:\Program Files\WireGuard\Data\Configurations\wg0.conf.dbapi”
```

You then need to set it as a manual start to ensure it's not running every time the computer starts. If you don't do this it gets into a bind when it is in the office as the local routing conflicts with WireGuard routing.

It installs the service named `“WireGuardTunnel$wg0”`

```
sc config WireGuardTunnel$wg0 start=demand
```

Download and install (requires elevation) the `ServiceTray` application:

[https://www.coretechnologies.com/products/ServiceTray/](https://www.coretechnologies.com/products/ServiceTray/)

As you install it, choose the green play arrow style button, and then select the WireGuard Tunnel Service: wg0. Choose to browse to your user's desktop folder to install the shortcut - we copy/move this to the startup folder once finished.

Next, you must install `ServiceSecurityEditor` to change the permissions (requires elevation):

[https://www.coretechnologies.com/products/ServiceSecurityEditor/](https://www.coretechnologies.com/products/ServiceSecurityEditor/)

Select the WireGuard Tunnel Service: wg0 to then change the INTERACTIVE user to allow it to start, stop and pause the service.

We then move the icon we installed on the desktop to the startup folder using WIN+R, or Run `shell:startup`. This should bring up the users' startup folder for you to drag the icon into. After a restart, and the user logs on, you should find that there is a new icon in the system tray of a RED play arrow icon. You can click this and choose to start and stop the WireGuard Service.
