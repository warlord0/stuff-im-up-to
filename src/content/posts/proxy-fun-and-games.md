---
pubDatetime: 2018-10-11T17:55:44Z
modDatetime: 2019-03-21T21:13:30Z
title: "Proxy Fun and Games"
tags:
  - "Linux"
  - "Networking"
  - "proxy"
  - "Windows"
description: "I seem to spend most of may day trying to sort out issues regarding getting different applications through the corporate proxy server. I'm really hoping on"
---
I seem to spend most of may day trying to sort out issues regarding getting different applications through the corporate proxy server. I'm really hoping one day we can setup a transparent proxy if for no other reason than to make our development lives easier. At present we need use a browser proxy script (`http://wpad/wpad.dat`) to determine which of the corporate proxy servers to use. We have an internet proxy and a Gov't gateway proxy. Depending where the user is trying to go determines which proxy they must use. The script works just fine for 99% of our user base. However, when it comes to the other 1% there's need to tell not just the browser what proxy to use, but in the development world we need to inform the various development tools how to use a proxy too. This is where the pain is. We need to setup a proxy in several places eg. for the operating system, for the browser, for Git, for NPM/Yarn, for Composer, for Java...

### Operating System

#### Windows

Open a CMD/PowerShell window with Administrative permissions

    C:> netsh winhttp set proxy http://username:password@192.168.0.117:8080 "<local>"

You may not need the username and password here as the OS will send your Windows credentials. The `<local>` means bypass the proxy for any local address. You may add into that for other specific servers eg. `"<local>,server.domain.tld"`

##### Also set the Environment variables for the proxy

Windows Key + R `control sysdm.cpl,,3` Click the environment settings and add in the following settings to your user variables.

    http_proxy=http://username:password@192.168.0.117:8080
    https_proxy=http://username:password@192.168.0.117:8080
    all_proxy=http://username:password@192.168.0.117:8080
    no_proxy=localhost,domain.local,192.168.56.2

#### Linux

    $ sudo vi /etc/envronment

    http_proxy=http://username:password@192.168.0.117:8080
    https_proxy=http://username:password@192.168.0.117:8080
    all_proxy=http://username:password@192.168.0.117:8080
    no_proxy=localhost,domain.local,192.168.56.2

### Git proxy settings

    $ git config --global http.proxy http://username:password@192.168.0.117:8080

You'll probably need to ensure this is set for the `sudo` environment too if you ever have the need to install global requirements with `npm`.

    $ sudo git config --global http.proxy http://username:password@192.168.0.117:8080

### NPM proxy settings

    $ npm config set proxy http://username:password@192.168.0.117:8080

Again you'll probably need to ensure it's replicated into `sudo`.

    $ sudo npm config set proxy http://username:password@192.168.0.117:8080

This actually writes to a file in your home folder called `.npmrc` which you can edit if you need to put in some backslashes to escape and special characters in your password. eg. `c:\Users\myuser\.npmrc` or `~/.npmrc` and the `sudo` version will write it into the root users home folder.

### Yarn proxy settings

As Yarn is essentially npm on steroids it works the same way but writes to `~/.yarnrc`

    $ yarn config set proxy http://username:password@192.168.0.117:8080
    $ sudo yarn config set proxy http://username:password@192.168.0.117:8080

### Composer proxy settings

Thankfully this is capable of using the Operating System proxy environment variables. So if you set them as above for Windows and/or Linux you should be good to go.

### Java proxy settings

This has it's own rules just like all the others. But you may also run into Java applications having their own proxy settings too. Such as gradle which has it's own properties file to setup the proxy. They all seem to be a similar pattern though, edit a properties file and add in:

    http.proxyHost=192.168.0.117
    http.proxyPort=8080
    http.nonProxyHosts=localhost|127.*|[::1]|*.domain.local

Typically this is done in the JRE's `lib/net.properties` file so it applies to Java globally. eg. My net.properties file is located under `c:\Program Files\Java\jdk1.80_151\lib` and has plenty of helpful commented examples on how to set things. Under Debian my `net.properties` is located under `/usr/lib/jvm/java-1.8.0-openjdk-amd64/jre/lib` They can also be passed to the Java command line as `-D` parameters eg.

    $ java -Dhttp.proxyHost=192.168.0.117 -Dhttp.proxyPort=8080 -Dhttp.nonProxyHosts="localhost|domain.local"
