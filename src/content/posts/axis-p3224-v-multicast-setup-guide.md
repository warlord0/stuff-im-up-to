---
pubDatetime: 2026-05-19T17:48:17+00:00
title: "AXIS P3224-V Multicast Setup Guide"
tags:
  - "Networking"
  - "Multicast"
  - "Rtp"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Overview Receiving multicast video streams from AXIS cameras requires proper network configuration at multiple levels: kernel, firewall, multicast group membership, and RTP/H.264 decoding. This guide documents the steps required to successfully receive and record RTP multicast streams from an AXIS P3224-V Mk II camera using GStreamer. Network Setup in This Example ComponentValueCamera IP10.0.133.12Client IP10.0.133.83Network Interfaceenp86s0Multicast…"
---
## Overview

Receiving multicast video streams from AXIS cameras requires proper network configuration at multiple levels: kernel, firewall, multicast group membership, and RTP/H.264 decoding.

This guide documents the steps required to successfully receive and record RTP multicast streams from an AXIS P3224-V Mk II camera using GStreamer.

------------------------------------------------------------------------

## Network Setup in This Example

|                   |                    |
|-------------------|--------------------|
| Component         | Value              |
| Camera IP         | 10.0.133.12        |
| Client IP         | 10.0.133.83        |
| Network Interface | enp86s0            |
| Multicast Address | 239.220.219.168    |
| RTP Port          | 50000              |
| Codec             | H.264 Main Profile |
| Frame Rate        | 30 fps             |
| Resolution        | 1280×720           |

------------------------------------------------------------------------

## Camera Configuration

### Camera RTP Settings

Configure the camera for **Always Multicast** mode:

1.  Go to:

    System Options → RTP Settings

2.  Configure:

|                         |                 |
|-------------------------|-----------------|
| Setting                 | Value           |
| Multicast Video Address | 239.220.219.168 |
| Video Port              | 50000           |
| Always Multicast Video  | Enabled         |

> Avoid using Video Port = 0 unless you intentionally want dynamic port assignment.

3.  SDP endpoint:

    http://10.0.133.12/axis-cgi/alwaysmulti.sdp?camera=1

This endpoint requires HTTP Digest authentication.

------------------------------------------------------------------------

### Always Multicast Behaviour

In Always Multicast mode, the camera:

- Streams continuously to the multicast address
- Does NOT require RTSP SETUP/PLAY negotiation
- Publishes stream metadata via SDP
- Sends RTP packets directly over UDP multicast

------------------------------------------------------------------------

## Client-Side Configuration

### 1. Kernel Settings (sysctl)

Enable multicast-friendly networking:

    sudo sysctl -w net.ipv4.igmp_max_memberships=20
    sudo sysctl -w net.ipv4.conf.all.rp_filter=0
    sudo sysctl -w net.ipv4.conf.enp86s0.rp_filter=0

### Explanation

#### igmp_max_memberships

    net.ipv4.igmp_max_memberships

Maximum number of multicast groups the kernel can join simultaneously.

#### rp_filter

    net.ipv4.conf.*.rp_filter

Reverse Path Filtering.

When enabled (1), Linux drops packets that do not arrive on the interface expected by the routing table. This frequently breaks multicast reception on multihomed systems.

Set to:

    0

to disable strict validation.

------------------------------------------------------------------------

### Verify

    cat /proc/sys/net/ipv4/igmp_max_memberships
    cat /proc/sys/net/ipv4/conf/all/rp_filter
    cat /proc/sys/net/ipv4/conf/enp86s0/rp_filter

------------------------------------------------------------------------

### 2. Firewall Configuration (UFW)

If UFW is enabled with:

    DEFAULT_INPUT_POLICY="DROP"

multicast traffic will usually be blocked.

Allow multicast:

    sudo ufw allow in on enp86s0 to 239.0.0.0/8

------------------------------------------------------------------------

### Verify Firewall Rules

    sudo iptables -L INPUT -v -n | grep -i 239

------------------------------------------------------------------------

## 3. Multicast Group Membership

Applications receiving multicast must:

1.  Join the multicast group (IGMP)
2.  Bind a UDP socket to the multicast port

Normally, GStreamer handles this automatically.

------------------------------------------------------------------------

### Verify Group Membership

Run a receiver, then verify:

    ip maddr show dev enp86s0

Expected output:

    inet 239.220.219.168

------------------------------------------------------------------------

### Multicast MAC Address Mapping

IPv4 multicast addresses map to Ethernet MAC addresses using:

    01:00:5e:xx:xx:xx

For:

    239.220.219.168

the correct multicast MAC is:

    01:00:5e:5c:db:a8

Calculation:

    0xdc & 0x7f = 0x5c

------------------------------------------------------------------------

### Manual Multicast MAC Join (Troubleshooting Only)

Normally unnecessary, but useful for debugging NIC multicast filtering:

    sudo ip maddr add 01:00:5e:5c:db:a8 dev enp86s0

You can also force all multicast traffic:

    sudo ip link set enp86s0 allmulticast on

------------------------------------------------------------------------

### Retrieving the SDP File

The SDP describes:

- RTP payload type
- codec
- SPS/PPS initialization data
- multicast address
- ports

Retrieve it with Digest authentication:

    curl -s --digest -u user:password \
      http://10.0.133.12/axis-cgi/alwaysmulti.sdp?camera=1 \
      > stream.sdp

------------------------------------------------------------------------

### Example SDP

    v=0
    o=- 1188340656180883 1 IN IP4 10.0.133.12
    s=Session streamed with GStreamer
    t=0 0
    m=video 50000 RTP/AVP 96
    c=IN IP4 239.220.219.168/5
    a=rtpmap:96 H264/90000
    a=fmtp:96 packetization-mode=1;profile-level-id=4d0029;sprop-parameter-sets=Z00AKeKQCgC3YC3AQEBpB4kRUA==,aO48gA==
    a=framerate:30.000000

------------------------------------------------------------------------

### Important SDP Fields

|                          |                                     |
|--------------------------|-------------------------------------|
| Field                    | Meaning                             |
| m=video 50000 RTP/AVP 96 | RTP video stream on UDP port 50000  |
| a=rtpmap:96 H264/90000   | Payload type 96 = H.264             |
| packetization-mode=1     | FU-A fragmentation enabled          |
| sprop-parameter-sets     | SPS/PPS decoder initialization data |

------------------------------------------------------------------------

## Root Cause of the Original Failure

The multicast networking was functioning correctly.

GStreamer successfully received RTP packets, but:

- rtph264depay did not output valid H.264 frames
- mp4mux created empty MP4 containers

The root cause was:

    Missing SPS/PPS decoder initialization

The AXIS stream did not reliably transmit SPS/PPS in-band during startup, so the values from:

    sprop-parameter-sets

had to be explicitly supplied in the RTP caps.

Additionally:

- the comma inside sprop-parameter-sets
- must be wrapped as a quoted string
- inside the capsfilter

or GStreamer fails to parse the caps.

------------------------------------------------------------------------

## Receiving the Stream

### Method 1: Record Raw H.264

    gst-launch-1.0 -e -v \
      udpsrc address=0.0.0.0 \
        multicast-group=239.220.219.168 \
        port=50000 \
        auto-multicast=true \
        multicast-iface=enp86s0 \
        buffer-size=4194304 \
      ! 'application/x-rtp,media=(string)video,encoding-name=(string)H264,payload=(int)96,clock-rate=(int)90000,packetization-mode=(string)1,sprop-parameter-sets=(string)"Z00AKeKQCgC3YC3AQEBpB4kRUA==,aO48gA=="' \
      ! rtpjitterbuffer latency=1000 \
      ! rtph264depay \
      ! h264parse config-interval=-1 \
      ! video/x-h264,stream-format=byte-stream,alignment=au \
      ! filesink location=capture.h264

------------------------------------------------------------------------

### Method 2: Record MP4

    gst-launch-1.0 -e -v \
      udpsrc address=0.0.0.0 \
        multicast-group=239.220.219.168 \
        port=50000 \
        auto-multicast=true \
        multicast-iface=enp86s0 \
        buffer-size=4194304 \
      ! 'application/x-rtp,media=(string)video,encoding-name=(string)H264,payload=(int)96,clock-rate=(int)90000,packetization-mode=(string)1,sprop-parameter-sets=(string)"Z00AKeKQCgC3YC3AQEBpB4kRUA==,aO48gA=="' \
      ! rtpjitterbuffer latency=1000 \
      ! rtph264depay \
      ! h264parse config-interval=-1 \
      ! video/x-h264,stream-format=avc,alignment=au \
      ! mp4mux faststart=true \
      ! filesink location=capture.mp4

------------------------------------------------------------------------

### Method 3: Live Playback

    gst-launch-1.0 -e -v \
      udpsrc address=0.0.0.0 \
        multicast-group=239.220.219.168 \
        port=50000 \
        auto-multicast=true \
        multicast-iface=enp86s0 \
        buffer-size=4194304 \
      ! 'application/x-rtp,media=(string)video,encoding-name=(string)H264,payload=(int)96,clock-rate=(int)90000,packetization-mode=(string)1,sprop-parameter-sets=(string)"Z00AKeKQCgC3YC3AQEBpB4kRUA==,aO48gA=="' \
      ! rtph264depay \
      ! h264parse \
      ! avdec_h264 \
      ! videoconvert \
      ! autovideosink

------------------------------------------------------------------------

## Useful Diagnostics

### Verify Multicast Reception

    sudo tcpdump -i enp86s0 host 239.220.219.168

Large packets (~1200–1400 bytes) indicate RTP video traffic.

Small packets (~50–80 bytes) are usually RTCP control packets.

------------------------------------------------------------------------

### Verify GStreamer Receives UDP

    gst-launch-1.0 -v \
      udpsrc multicast-group=239.220.219.168 \
             port=50000 \
             auto-multicast=true \
             multicast-iface=enp86s0 \
      ! identity silent=false \
      ! fakesink

------------------------------------------------------------------------

### Dump Raw RTP Packets

    gst-launch-1.0 -v \
      udpsrc multicast-group=239.220.219.168 \
             port=50000 \
             auto-multicast=true \
             multicast-iface=enp86s0 \
      ! identity dump=true silent=false \
      ! fakesink

------------------------------------------------------------------------

## Troubleshooting Checklist

- Camera and client are on reachable subnets
- rp_filter=0
- Firewall permits multicast traffic
- RTP packets visible in tcpdump
- Multicast group joined (ip maddr show)
- GStreamer receives UDP packets
- sprop-parameter-sets copied correctly from SDP
- Camera GOP/I-frame interval not excessively large
- Managed switches configured correctly for IGMP snooping

------------------------------------------------------------------------

## Notes on IGMP Snooping

Managed switches with IGMP snooping enabled may block multicast unless:

- an IGMP querier exists
- multicast routing is configured
- or snooping is disabled

If multicast delivery behaves inconsistently, temporarily test with:

    sudo ip link set enp86s0 allmulticast on

------------------------------------------------------------------------

## References

- RFC 1112 — Host Extensions for IP Multicasting
- RFC 2236 — IGMPv2
- RFC 3376 — IGMPv3
- RFC 3550 — RTP
- RFC 6184 — RTP Payload Format for H.264 Video
- AXIS Multicast Documentation:\
  <https://help.axis.com/en-us/axis-os-knowledge-base#multicast-video-streaming>
