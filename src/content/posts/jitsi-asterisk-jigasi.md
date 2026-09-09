---
pubDatetime: 2020-04-15T20:19:58Z
modDatetime: 2020-04-15T20:25:27Z
title: "Jitsi + Asterisk = Jigasi"
tags:
  - "asterisk"
  - "Docker"
  - "jitsi"
  - "Linux"
description: "As I'm working on Asterisk right now the actual challenge is to get Jitsi configured so we can conference in audio users to our video chats. To do this you"
---
As I'm working on Asterisk right now the actual challenge is to get Jitsi configured so we can conference in audio users to our video chats. To do this you need to use a SIP add-on called 'Jigasi'.

The whole Asterisk thing has been an uphill challenge for me. Connecting SIP used to be - unbox a phone plug it into the LAN, let DHCP tell it where the VoIP server was and that's all she wrote. I never had the need to be involved at the server end, configuring extensions and call routing, etc.

So once my Asterisk server was alive and I could make calls to and from other mobile phone SIP clients hooking up Jitsi was next.

On the Asterisk side I treated Jitsi/Jigasi as just another SIP extension. I added it into my `ps_endpoints`, `ps_aors` and `ps_auths` in exactly the same way as any other phone as extension 801.

Jisti already has a docker-compose ready to rock - [https://github.com/jitsi/docker-jitsi-meet](https://github.com/jitsi/docker-jitsi-meet)

I followed the instructions, pulled it down and edited the `.env`, paying attention to the Jigasi section:

```
#
# Basic Jigasi configuration options (needed for SIP gateway support)
#

# SIP URI for incoming / outgoing calls
JIGASI_SIP_URI=801@pbx.domain.tld

# Password for the specified SIP account as a clear text
JIGASI_SIP_PASSWORD=801

# SIP server (use the SIP account domain if in doubt)
JIGASI_SIP_SERVER=pbx.domain.tld

# SIP server port
JIGASI_SIP_PORT=5061

# SIP server transport
JIGASI_SIP_TRANSPORT=TLS
```

- *Obviously you should use stronger passwords.*

Then started up the container set:

```
$ docker-compose -f docker-compose.yml -f jigasi.yml up -d
```

Pay attention to the way it uses two compose files. It can get messy shutting things down when you use `-d` to detach. You'll need to stop jigasi separately from the rest of the container set:

```
$ docker stop $(docker container ps -f "name=jigasi" -q)
$ docker-compose down
```

With the Jigasi config entered if you have pjsip debug turned on for the Asterisk server you'll see it getting connected.

```
*CLI> pjsip set logger on
```

When in a Jitsi conference you should see a `+` button toward the bottom left. You can invite your other callers or extensions in by entering their number in the dialog. You'll then see them hitting the Asterisk console as they are dialled to join in.

## Issues

I faced a couple of niggling issues as I set things up. The dreaded "488 Not Acceptable Here" has been the bane of my existence in the Asterisk setup. I wasn't sure what the problem was, but the usual candidate is a codec.

Looking at the Asterisk console and logs I noticed that it mentioned opus - I know opus is a codec and I then found it wasn't installed - and isn't included with Asterisk. I needed to install it into my docker image by downloading and extracting the `.tar.gz` from Digium -

[https://downloads.digium.com/pub/telephony/codec_opus](https://downloads.digium.com/pub/telephony/codec_opus)

The next problem I spotted in the log related to there being no `res_srtp` module loaded and therefore no SRTP available. It seems Jitsi expects SRTP . I had to modify the docker image again and include `libsrtp2-dev` in the operating system for Asterisk to be compiled with the necessary `res_srtp` module.

Now SRTP is alive it was then time to set some values in `ps_endpoints` for the extension:

```
transport: null
aors: 801
auth: 801
context: call-router
allow: opus|ulaw|alaw|g722
direct_media: no
rewrite_contact: yes
rtp_symmetric: no
media_encryption: sdes
media_encryption_optimistic: yes
```

Now Jitsi connects using SRTP and can use the opus codec.

### SIP Client

I set the same settings for my extension and then went to set up my Grandstream Wave on my phone.

In "Settings \> Account Settings \> Account", "Codec Settings \> SRTP Mode \> Enabled And Forced" and under "Preferred Vocoder" for Wifi and Mobile networks I turned on Opus and G.722.
