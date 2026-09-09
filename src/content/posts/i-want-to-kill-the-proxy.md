---
pubDatetime: 2019-07-03T19:11:58Z
modDatetime: 2019-07-04T19:25:29Z
title: "I Want to Kill the Proxy"
tags:
  - "Linux"
  - "proxy"
description: "Working behind a non-transparent corporate proxy and firewall is enough to make you psychotic! You'll find enough post on here about setting up environment variables and handling proxies, but there's always room for one more."
---
Working behind a non-transparent corporate proxy and firewall is enough to make you psychotic! You'll find enough posts on here about setting up environment variables and handling proxies, but there's always room for one more.

When you're working on a portable device, like a laptop, that you then remote into the office over a VPN you need to be flexible and turn on and off the proxy at will. This lead me to chain together a number of my proxy related articles into the way I currently handle the proxy on the move.

We know about the environment variables from [Proxy Fun and Games](https://warlord0blog.wordpress.com/2018/10/11/proxy-fun-and-games/) and [Sudo and Proxy / Environment Variables](https://warlord0blog.wordpress.com/2018/08/15/sudo-and-proxy-environment-settings/). But if we hard code these variables into `/etc/environment` then what happens when we're on the road, out of the office? We still get a proxy that we need to turn off.

> We have two choices. If we work primarily in the office, add the variables to the `/etc/environment` file. If we're mainly out of the office DON'T.

Now based on this [article](https://www.shellhacks.com/linux-proxy-server-settings-set-proxy-command-line/) I decided to bash script my set and unset, so I can call it when I like. This involves adding the following into your users `~/.bashrc` file or in my case my `~/.zshrc` file.

```
# Set Proxy
 function setproxy() {
     export {http,https,ftp}_proxy="http://user:password@proxy_host:port"
     export no_proxy="localhost,127.0.0.1,*.domain.local"
     touch ~/.proxy
 }
 # Unset Proxy
 function unsetproxy() {
     unset {http,https,ftp,no}_proxy
     if [[ -e ~/.proxy ]]; then
         rm ~/.proxy
     fi
 }
 if [[ -e ~/.proxy ]]; then
     setproxy
     echo "Proxy Set"
 else
     unsetproxy
     echo "NO Proxy"
 fi
```

Logout and when you return you can then use:

```
$ setproxy
$ unsetproxy
```

To easily turn on and off the proxy. Use `printenv` to see your environment variables. I took things a little futher as each time I started a new tab in SmarTTY I'd have to set/unet my proxy again. I added persistence by creating a file `~/.proxy` which if it exists then I set the proxy on session start.

Now this does cause a problem with `apt`. But that's only because you need to follow the above article on [Sudo and Proxy / Environment Variables](https://warlord0blog.wordpress.com/2018/08/15/sudo-and-proxy-environment-settings/).

I'm sure there will be other apps that don't use the environment variables that need to be handled, but this goes a long way to sorting things out for me.
