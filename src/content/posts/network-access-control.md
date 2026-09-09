---
pubDatetime: 2016-09-23T09:18:43Z
modDatetime: 2016-09-23T09:24:28Z
title: "Network Access Control"
tags:
  - "Linux"
  - "Networking"
  - "Security"
description: "In order to satisfy a number of security requirements we implemented 802.1X authentication throughout our network - wired and wireless. Initially this was"
---
In order to satisfy a number of security requirements we implemented 802.1X authentication throughout our network - wired and wireless. Initially this was done using Windows NPS (RADIUS) and the built in capabilities of our Extreme network switches. It works very well. No one can plug into the LAN and get connected to the business network without authentication. If you're not authenticated you get dropped onto the Guest VLAN and can access the Internet, but no business systems. Great. We're protected, but there are a few quirks and then this is where I visited the world of Open Source and stumbled over [PacketFence](https://packetfence.org/).

## The Guest Network

As a network admin I'd really rather not provide any form of access for non-authenticated users. But as a business, management want to give free access to the Internet to visitors and contractors. On the other hand they also want to know what staff are doing and monitor and restrict the internet traffic. Well this is all a bit contradictory as simply by connecting to the Guest network you get anonymous internet usage (albeit proxied and filtered). As the Guest Wi-Fi SSID is protected by simple WPK Key every man and his dog now has it on their personal mobile phone and has free reign to use the internet anonymously on their personal device, but not the business computer. So the preferred way of solving this is to use a sponsorship system. In order to connect to the network you must connect though a web portal, specify who they are and then enter the details of a member of staff who will receive an email that they must authorise in order for the guest user to get connected for the day. The nice bit about this is we can also restrict who can authorise access, thankfully it doesn't need to be only IT staff as we have enough to do. This means that a member of staff can't authorise themselves and I'm sure their manager would soon get fed up of the daily request to authorise their staff members personal access to the internet.

## So how does all this work?

PacketFence is the core of the system that manages the access requests and portal. It also talks to the network switches and wireless access points and controls the users access to the VLAN they require. The great thing about much of PacketFence is that it's pretty much all manageable through the Web UI. It's installation, including all it's prerequisites is extremely straight forward. That's not to say the small number non-graphical changes aren't as frustrating as ever. We all have our own foibles on our own networks that usually mean a few changes under the bonnet. PacketFence requires network switches and devices that are capable of being managed and fortunately we've made some good choices in using [Extreme Networks](http://www.extremenetworks.com/) and [AeroHive](http://www.aerohive.com/) for this. The control is done over a number of mechanisms and is flexible enough for you to specify which your switches use, from SNMP, RADIUS and even Web. The change to our core network configuration on the switches changes only very slightly. Primarily in the choice of RADIUS server, we now change that to the PacketFence server instead of the Windows NPS server. That doesn't mean that NPS is redundant, far from it. It means that the switches use PacketFence as a proxy to the NPS server when the credentials are available from the client. It also means we don't have to roll out the PacketFence changes to every switch over night. It can be a gradual migration a switch at a time.

### Recipes

Having the right equipment helps. It means there are already some well established guides on how to get things going. The ones we used are here, but also included are guides for many different manufacturers. [AeroHive Quick Installation Guide](https://packetfence.org/doc/PacketFence_Aerohive_Quick_Install_Guide.html) [Extreme Networks Configuration Guide](https://packetfence.org/doc/PacketFence_Network_Devices_Configuration_Guide.html#_extreme_networks)

### Getting your head around PacketFence

Without a doubt there's a lot in this config. PacketFence makes use of many existing products to provide a single solution. Everything that gets installed as a requirement, such as free-radius, exists in the traditional sense that it gets installed where you'd expect it, but PacketFence will then drive the configuration. So what you'll find is all the configuration files where you'd expect them, but they aren't the ones that are being used.

> The configs you're looking for will be under /usr/local/pf

I spent some frustrating times changing configs that weren't used and wondered why things didn't work!
