---
pubDatetime: 2018-07-13T12:11:54Z
modDatetime: 2019-07-10T12:40:27Z
title: "Building a Debian Development Server"
tags:
  - "JavaScript"
  - "Laravel"
  - "Linux"
  - "node.js"
  - "php"
  - "Web"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "When I setup a development system there are a few steps I follow to get everything working together. The aim is to get everything installed to provide php"
---
When I setup a development system there are a few steps I follow to get everything working together.

The aim is to get everything installed to provide php and composer, node, nginx, mysql and Laravel as a base to build on.

## Install Debian

I take the latest amd64 version using a network installable iso. This way if I use an older 9.1, 9.2, 9.3 version iso, being a netinst version I'll end up with the latest in that series as it downloads from the net.

Mostly making a 50GB disk is more than enough, as it's thin provisioned on a virtual, space isn't really a concern. When it comes to partitioning I've learned to take the easy option and create one partition to mount all filesystems into it.

![Capture1](/blog-media/2018/07/capture11.png)

As it's a development platform I never install a desktop environment. I never need to use any GUI programs on the server. The only options I choose to install are the standard system utilities and the ssh server.

![Capture2](/blog-media/2018/07/capture2.png)

Out of personal preference, once up and running I install sudo, zsh, curl and git.

```
# apt-get install sudo zsh curl git
```

Then I add my non-root user to the sudo group so I can stop using root and use my regular user account to ssh onto the dev server..

```
# usermod -aG sudo [user]
```

## Setup OhMyZsh

I like using zsh and the [OhMyZsh](https://ohmyz.sh/) which is why I installed curl and git. So logon as your non-root user.

```
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

Then I edit the `~/.zshrc` file and change the theme to "bureau".

## Network Config

If I'm building a Virtual Box guest that runs on my local PC I'll setup two interfaces. If it's a virtual on VMWare I'll just use the one production interface.

On a local Virtual Box I use one interface as NAT, so it gets a DHCP address like 10.0.2.15 which all outgoing traffic is routed by default. Makes life easier on a corporate network where network authentication is required. Using NAT like this means I don't need to authenticate my guest as it NAT via my physical hosts authenticated interface.

I then setup second interface so I can connect to what is being served from the guest. This is a "host only" interface and means only my local system can connect to it, but because of the NAT the guest will still have access to the corporate network resources/servers.

This means I end up with two devices usually named `enp0s3` (NAT) and `enp0s8` (Host Only) on Debian.

### Using a Static IP (optional)

I choose to make my system with a static IP. Using the Virtual Box DHCP server on a "host only" interface gives out a `192.168.56.101` address to the first guest, 102 to the second and so on. But you can end up with inconsistent IP's for your hosts. So making them static is a better option IMO.

Edit `/etc/network/interfaces` and set you host only adapter to static:

```
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo

iface lo inet loopback

# The primary network interface
allow-hotplug enp0s3
iface enp0s3 inet dhcp

allow-hotplug enp0s8
iface enp0s8 inet static
  address 192.168.56.2
  netmask 255.255.255.0
```

This way My dev system always gets the static IP I chose for it.

```
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
  link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
  inet 127.0.0.1/8 scope host lo
    valid_lft forever preferred_lft forever
  inet6 ::1/128 scope host 
    valid_lft forever preferred_lft forever
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
  link/ether 08:00:27:61:a6:a8 brd ff:ff:ff:ff:ff:ff
  inet 10.0.2.15/24 brd 10.0.2.255 scope global enp0s3
    valid_lft forever preferred_lft forever
  inet6 fe80::a00:27ff:fe61:a6a8/64 scope link 
    valid_lft forever preferred_lft forever
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
  link/ether 08:00:27:2b:04:26 brd ff:ff:ff:ff:ff:ff
  inet 192.168.56.2/24 brd 192.168.56.255 scope global enp0s8
    valid_lft forever preferred_lft forever
  inet6 fe80::a00:27ff:fe2b:426/64 scope link 
    valid_lft forever preferred_lft forever
```

## Install PHP

Because we don't want Apache2 installed you need to install `php-fpm` which won't force an install of Apache.

```
$ sudo apt-get install php-fpm
```

It will include a load of other php components you need, but no Apache, so you can then choose to move on to Nginx or some other php service.

Add the Laravel php requirements

```
$ sudo apt-get install php-mbstring php-zip php-xml php-dev php-dom php-ldap libpng-dev make gcc g++
```

The additional module `libpng-dev` is required for Laravel to build using NodeJS npm. Without `libpng-dev`, `make`, `gcc` and `g++`, under your Laravel project folder the call to `$ npm i` fails with errors like:

```
> pngquant-bin@4.0.0 postinstall /home/user/myproject/node_modules/pngquant-bin
> node lib/install.js
⚠ The `/home/user/myproject/node_modules/pngquant-bin/vendor/pngquant` binary doesn't seem to work correctly
⚠ pngquant pre-build test failed
ℹ compiling from source
✔ pngquant pre-build test passed successfully
✖ Error: pngquant failed to build, make sure that libpng-dev is installed
at Promise.all.then.arr (/home/user/myproject/node_modules/pngquant-bin/node_modules/bin-build/node_modules/execa/index.js:231:11)
at <anonymous>
at process._tickCallback (internal/process/next_tick.js:188:7)
```

## Install MySQL

As you'll need a database you'll want to install MySQL. These days MySQL is installed from the MySQL site by downloading a `.deb` file which add the Oracle repositories. The version of MySQL in the Debian repositories is MariaDB, a fork of MySQL.

> If you go for the Oracle version  you'll probably need to ensure you use legacy authentication for now.

Include the php drivers as we install the server:

```
$ sudo apt-get install mysql-server php-mysql
```

To manage MariaDB using `mysql` you need to use sudo:

```
$ sudo mysql -u root
...
MariaDB [(none)]>
```

## Install Composer

Go to your home folder and use the command line install from here: [https://getcomposer.org/download/](https://getcomposer.org/download/)

You'll end up with a file `composer.phar`. This is ok if you're the only one going to use it but I like to put it in `/usr/bin` as just `composer` so it is available for everyone.

```
$ sudo cp ~/composer.phar /usr/bin/composer
$ sudo chmod 755 /usr/bin/composer
```

## Install NodeJS

Install it using a package manager following the steps for Debian

https://nodejs.org/en/download/package-manager/

```
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

Then the first thing I do is update npm.

```
$ sudo npm i npm -g
```

## Install Samba

Because not all development takes place on a Linux host this will allow us access to shares for Windows clients.

```
$ sudo install samba
```

Edit `/etc/samba/smb.conf` and make some simple changes.

`workgroup=[NETBIOS DOMAIN NAME]`

Then find `[homes]` and in that section change:

```
read only = no
create mask = 640
directory mask = 750
```

Create a password entry for your non-root user:

```
$ sudo smbpasswd -a [user]
```

Then restart Samba

```
$ sudo systemctl restart smbd
```

Then when you browse to the server from windows you should see and have access to your home folder eg. `\\192.168.56.2\user`

## Installing Laravel

I prefer to install Laravel as a project using the Create Project method:

```
$ composer create-project --prefer-dist laravel/laravel [myproject]
```

This downloads all of the PHP composer prerequisites and delivers the project.

Once the project is created you can go into the folder \[myproject\] and check you can compile the assets using Node.

```
$ cd myproject
$ npm i
```

This will install all of the NodeJS prerequisites used for building/compiling your assets using the Laravel asset management tools - currently Laravel Mix (Based on Webpack). So with the Node modules installed you should be able to run prod and dev builds:

```
$ npm run dev
$ npm run prod
```

These should complete successfully.

You can then run Laravel's built in development server to serve your project:

```
$ php artisan serve
```

But in reality this will fire up a pretty useless server listening on the IP address 127.0.0.1 on port 8000. So it's only accessible from the development server.

As we're going to need to access it from our client development machine we need to serve on the actual IP of the server. The easiest way of doing this is to serve it on every IPv4 interface on the server (you probably only have one, so it shouldn't matter). To do this use:

```
$ php artisan serve --host=0.0.0.0
```

and if you want to specify the port you can use:

```
$ php artisan serve --host=0.0.0.0 --port=8001
```

Now you can access it from any client pointing your browser at `http://192.168.56.2:8001` and begin exploring your Laravel project.

### More Laravel

Of course serving a version of your project like this isn't the only way to go. You should continue into dynamically building your assets using `npm run watch` and maybe even using tools like `browserify` to make changes happen at the browser end so you're not building and refreshing all the time.

I also like to move away from a development web server and setup [Nginx](/posts/nginx-and-laravel/) to handle serving my Laravel Project.

## Further Reading

/posts/ssh-logon-with-private-key/

/posts/debian-stretch-ntp-time-sync/

/posts/php7-0-microsoft-sql-driver-debian-stretch/

/posts/installing-updating-webmin/
