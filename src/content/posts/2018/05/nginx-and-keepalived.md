---
pubDatetime: 2018-05-15T14:23:44Z
modDatetime: 2020-05-25T20:01:58Z
title: "Nginx and Keepalived"
tags:
  - "Linux"
  - "Networking"
  - "nginx"
  - "proxy"
heroImage: "/blog-media/2016/09/2000px-nginx_logo-svg.png"
description: "I have a need to deploy a High Availability Load Balanced reverse proxy solution. We have a back end web service that requires resilience. To achieve this"
---
I have a need to deploy a High Availability Load Balanced reverse proxy solution. We have a back end web service that requires resilience. To achieve this I've been looking at Nginx and Keepalived. The Nginx Plus product appears to contain high availability support - but we're in the realms of zero budget and open source/community supported products.

The front end reverse proxy I'll use is Nginx, but it could be anything. The clever part is going to be using keepalived to pass a single IP address between two servers.

Find yourself three fresh unused IP addresses. One for each server and one to share as the HA address.

eg. 192.168.1.224, 192.168.1.225, 192.168.1.226

First I installed a pair of Debian Stretch servers (loadbal01, loadbal02) and prepared them as per my usual minimum build with sshd and pretty much nothing else. I used the addresses .225 and .226 for my servers. I'll use .224 for the "virtual" HA address.

Just to test before converting Nginx into a reverse proxy I installed it box fresh onto each system and created an `index.html` file for them to serve just to show which one the keepalived was giving the IP address to.

```
$ sudo install nginx
```

Create the home page on each:

```
$ vi /var/www/html/index.html
```

```
<h1>PRIMARY</h1>
```

and put `SECONDARY` into loadbal02's index.html.

If you visit http://loadbal01 or http://loadbal02 you should see the respective index page.

Then instal keepalived:

```
$ sudo apt-get install keepalived
```

To configure keepalived edit `/etc/keepalived/keepalived.conf` - on the primary my config looks like:

```
global_defs {
  # Keepalived process identifier
  router_id nginx
}
# Script used to check if Nginx is running
vrrp_script check_nginx {
  script "/bin/check_nginx.sh"
  interval 2
  weight 50
}
# Virtual interface
# The priority specifies the order in which the assigned interface to take over in a failover
vrrp_instance VI_01 {
  state MASTER
  interface ens192
  virtual_router_id 51
  priority 110
  # The virtual ip address shared between the two loadbalancers
  virtual_ipaddress {
    192.168.1.224
  }
  track_script {
    check_nginx
  }
  authentication {
    auth_type AH
    auth_pass secret
  }
}
```

and on the secondary:

```
global_defs {
  # Keepalived process identifier
  router_id nginx
}
# Script used to check if Nginx is running
vrrp_script check_nginx {
  script "/bin/check_nginx.sh"
  interval 2
  weight 50
}
# Virtual interface
# The priority specifies the order in which the assigned interface to take over in a failover
vrrp_instance VI_01 {
  state BACKUP
  interface ens192
  virtual_router_id 51
  priority 100
  # The virtual ip address shared between the two loadbalancers
  virtual_ipaddress {
    192.168.1.224
  }
  track_script {
    check_nginx
  }
  authentication {
    auth_type AH
    auth_pass secret
  }
}
```

Notice the differences highlighted in **bold**.

Now the script that monitors nginx is running is a simple bash script that just returns an exit code of 1 if the process id isn't running. So you could pretty much write a bash script that returns an exit code of 1 for anything.

### /bin/check_nginx.sh - permissions 0755

```
#!/bin/sh

if [ -z "`/bin/pidof nginx`" ]; then
  exit 1
fi
```

Starting keepalived:

```
$ sudo systemctl start keepalived
```

My install made a couple of complaints in `/var/log/syslog` that needed addressing for it to work properly.

```
loadbal01 Keepalived[1650]: WARNING - default user 'keepalived_script' for script execution does not exist - please create.
```

and

```
loadbal01 Keepalived_vrrp[14383]: Unable to load ipset library - libipset.so.3: cannot open shared object file: No such file or directory
```

To resolve these issues I created the user with bare user level permissions and installed the package `libipset-dev`. Then restarted the keepalived daemon.

```
$ sudo useradd -g users -M keepalived_script
$ sudo apt-get install libipset-dev
```

```
$ sudo systemctl restart keepalived
```

On each server I then checked the IP address using `ip a` and as if by magic I could see the .224 address hosted on the primary/master machine.

Then I stopped nginx on the primary and within a second saw the logs elect a new master and the IP address was now hosted on the secondary/backup! So when I visit the URL `http://192.168.0.224/` I get the index page from whichever server owns the IP address.

### Primary /var/log/syslog

```
May 15 13:49:51 loadbal01 systemd[1]: Stopped A high performance web server and a reverse proxy server.
May 15 13:49:52 loadbal01 Keepalived_vrrp[17922]: pid 22322 exited with status 1
May 15 13:49:52 loadbal01 Keepalived_vrrp[17922]: VRRP_Script(check_nginx) failed
May 15 13:49:52 loadbal01 Keepalived_vrrp[17922]: VRRP_Instance(VI_01) Changing effective priority from 121 to 101
May 15 13:49:52 loadbal01 Keepalived_vrrp[17922]: VRRP_Instance(VI_01) Received advert with higher priority 120, ours 101
May 15 13:49:52 loadbal01 Keepalived_vrrp[17922]: VRRP_Instance(VI_01) Entering BACKUP STATE
```

### Secondary /var/log/syslog

```
May 15 13:49:52 loadbal02 Keepalived_vrrp[3768]: VRRP_Instance(VI_01) forcing a new MASTER election
May 15 13:49:53 loadbal02 Keepalived_vrrp[3768]: VRRP_Instance(VI_01) Transition to MASTER STATE
May 15 13:49:54 loadbal02 Keepalived_vrrp[3768]: VRRP_Instance(VI_01) Entering MASTER STATE
```

So you can see that the pid 22322 must be the `check_nginx.sh` process returning an exit code of 1 and the ip failed over immediately.

Now the fail overs work as expected I can reconfigure Nginx to act as a reverse proxy.

[Nginx as a Reverse Proxy](https://warlord0blog.wordpress.com/2016/10/26/nginx-not-just-a-web-server/)

## IPTables / Arno Firewall for VRRP

When I brought the firewall up the failover stopped working. I figured I must be blocking the VRRP from telling its neighbour that it needed to take over. A bit of a Google later and  found a clue [here](https://stackoverflow.com/questions/12908701/keepalived-works-well-without-iptables?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa) that I need to allow the IP protocols for vrrp and ah (authentication) to be accepted.

```
$ sudo iptables -I INPUT -p 112 -d 224.0.0.18 -j ACCEPT
$ sudo iptables -I INPUT -p 51 -d 224.0.0.18 -j ACCEPT
```

Because I prefer to use `arno-iptables-firewall` to manage my `iptables` rules I needed to modify the config `/etc/arno-iptables-firewall/conf.d/00debconf.conf` to add in the IP Protocols to vrrp (112) and ah (51) which I could do either numerically or by name.

```
OPEN_IP="112,51"
```

or

```
OPEN_IP="vrrp,ah"
```

Restart the `arno-iptables-firewall` service and view the `iptables` rules to see vrrp and ah are now listed.

```
$ sudo systemctl restart arno-iptables-firewall

$ sudo iptables-save |less

-A EXT_INPUT_CHAIN -p vrrp -j ACCEPT
-A EXT_INPUT_CHAIN -p ah -j ACCEPT
```
