---
pubDatetime: 2026-09-03T16:20:19+00:00
title: "Travel Router"
tags:
  - "Networking"
  - "Linux"
  - "Openwrt"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Building a Travel Router That Doesn't Ruin Movie Night The problem This whole project exists because of one specific holiday. The accommodation's Wi-Fi died completely, for two full days. No terrestrial TV either. Two days of genuinely nothing, in the evenings, on holiday. I count it as a personal engineering achievement that I survived those…"
---
# Building a Travel Router That Doesn’t Ruin Movie Night

## The problem

This whole project exists because of one specific holiday. The accommodation’s Wi-Fi died completely, for two full days. No terrestrial TV either. Two days of genuinely nothing, in the evenings, on holiday. I count it as a personal engineering achievement that I survived those two days without my wife killing me.

That’s the sort of incident that turns “it’d be nice to have a backup” into an actual weekend project. Every holiday rental has some version of this risk: a Wi-Fi network that’s “fine” for checking email and catastrophic the moment you try to stream anything for more than twenty minutes — or, in this case, just dead outright. Add a Chromecast into the mix — a device that has zero tolerance for a wobbly connection, no local buffer to speak of, and a UI that just spins forever the moment things hiccup — and “watch a film in the evening” becomes a genuine reliability engineering problem.

The goal wasn’t to build the fastest travel router, or the smallest, or the most feature-packed. It was to build the most *boring* one: something that keeps a Chromecast stream alive even when the accommodation’s own network is actively falling over, recovers on its own, and doesn’t need debugging from a holiday cottage at 9pm.

## The shopping trip that wasn’t

The instinct, initially, was to just go and buy a proper travel router. TP-Link was the first stop and the first dismissal — underpowered for what was actually wanted, and firmly built for the “connect to hotel Wi-Fi and share it” use case rather than anything more resilient.

GL.iNet looked much more promising on paper — the Beryl and the Slate are both popular, well-regarded travel routers built specifically for this kind of use. Digging into actual owner reviews turned up a recurring pair of complaints, though: overheating under sustained use, and configuration quietly getting lost. Neither is a dealbreaker on its own, but for something meant to be *the* boring, dependable piece of the whole holiday, both felt like exactly the wrong kind of surprise to risk.

And then the obvious answer showed up sitting in a drawer: a couple of old Beelink Mini-S mini-PCs, recently retired from home server duty in favour of a more powerful Intel NUC. Small, fanless, genuinely capable x86-64 hardware, doing nothing. Rather than buying a purpose-built travel router at all, the plan became: put a full OpenWrt install on one of these instead.

The only actual money spent on the whole project was **£24** for a Netgear A7500 USB Wi-Fi adapter, secondhand off eBay — more on why below.

## Design philosophy: stability over everything

Early on it was worth being explicit about what *not* to optimise for:

- Not Wi-Fi 7, not multi-gigabit throughput, not maximum VPN speed
- Not pocket-router dimensions
- Not vendor travel-router firmware and its usual compromises

A single Chromecast stream needs very little bandwidth. What it needs is a network that doesn’t drop out, doesn’t stall DNS for half a minute at the wrong moment, and fails over to a backup connection without anyone noticing. That reframing — stability as the only real requirement — shaped basically every decision that followed.

## The hardware

The core is a Beelink Mini-S running a full OpenWrt operating system image — not a vendor router, not OpenWrt bolted onto something else, a genuine OpenWrt install on real PC hardware. That buys a mature Linux networking stack, proper package management, and none of the usual embedded-router firmware compromises the GL.iNet reviews had warned about.

Wireless is split across two physically separate radios, deliberately:

- **One radio is upstream-only** — it associates with whatever the accommodation’s Wi-Fi is, gets a DHCP lease, and that’s its entire job. This one’s built in: an Intel AC 3165.
- **A second, separate radio runs the local access point** — the private network the phone, laptop, and Chromecast actually join.

Keeping these physically separate (rather than trying to make one radio be both a client *and* an AP simultaneously) avoids a whole class of flaky repeater/WDS behaviour. It costs a second Wi-Fi adapter; it buys reliability.

The AP radio itself went through an interesting evolution. First up, while waiting for anything else to arrive, was a cheap Realtek RTL8192EU USB dongle already lying around — fine for proving the architecture, but 2.4GHz-only and running on a driver with an occasional (harmless but noisy) beacon-timing quirk in the kernel log. That’s what the £24 Netgear A7500 replaced — a proper dual-band MediaTek-based USB adapter, moved onto 5GHz with wide channels, and it delivered noticeably better throughput and signal to every client that joined it, while keeping the exact same network name and password, so nothing needed reconfiguring on the client side.

One small, very real lesson from that swap: a fold-out antenna genuinely needs room to fold out. Plugged in directly, the A7500 sat upside down against the case with no room for the antenna to move — a proper hardware constraint, not a software one. A short USB extension cable solved it completely, with a nice side effect of noticeably better signal once the antenna could actually orient itself properly.

## The architecture

```
    Accommodation Wi-Fi 
            |
            | Wi-Fi client 
            v 
    Upstream radio (WAN) 
            | 
            v 
+-----------------------+ 
|     Travel router     | 
|       (OpenWrt)       | 
+-----------+-----------+ 
            | Local AP radio 
            | 
      Private network 
     /      |        \ 
Chromecast phone    laptop`
```

Two additional pieces widen that WAN side: a USB phone-tether path as a backup connection, and a WireGuard tunnel back to a home server for reaching specific devices remotely. More on both below.

## The bit that actually matters day to day

For all the engineering underneath, the point of the whole exercise was that using it should feel exactly like using the home network. The private SSID and its password never change, wherever the router ends up plugged in. Checking into a new place means one small update — teaching the router that venue’s Wi-Fi credentials — and that’s it. Every device that already knows the private network carries on exactly as before.

That one update is done entirely through OpenWrt’s own web admin interface, in a browser — no terminal, no command line, none of the SSH work that went into building the rest of this. Scan for the new network, enter the password, save. A simple enough job, and the only bit of “admin” the whole setup ever actually asks of anyone once it’s built.

In practice, that means my wife’s experience of casting something to the Chromecast on holiday is identical to doing it at home. She doesn’t hunt through a Wi-Fi list for an unfamiliar hotel network, doesn’t type in a password off a card at reception, doesn’t even know the accommodation’s own Wi-Fi credentials exist. It’s the same network it always is, and the Chromecast is just there, the way it’s always there. That’s really the whole product.

## Making failover actually mean something

This is the section that directly answers the holiday that started the whole project. If the accommodation’s Wi-Fi goes down completely — not slow, not flaky, properly dead, the way it was for those two days — the router can tether to a phone’s mobile data over USB and keep the household online without anyone touching a setting. No terrestrial TV needed as a fallback plan this time.

The obvious naive approach — “if the Wi-Fi link drops, switch to mobile data” — misses the failure mode that actually matters. Wi-Fi can stay fully associated, with a perfectly valid IP address, while the accommodation’s own upstream internet is completely dead. Link-state alone can’t see that.

The fix is a proper multi-WAN manager doing real health checks: pinging multiple independent, diverse targets at a sane interval, requiring several consecutive failures before declaring a path dead (so a single dropped packet doesn’t cause a flap), and requiring a longer run of *successes* before trusting a recovered path again (so a marginal connection doesn’t bounce back and forth). Primary and backup paths are ordered by priority, not load-balanced — normal browsing should never quietly leak onto metered mobile data just because it happened to win a race.

This was validated properly, not just configured and trusted: a real link failure (pull the Wi-Fi), and separately, the *harder* case — link still associated, DHCP lease still valid, but a firewall rule silently blocking the actual health-check targets to simulate a truly dead upstream. Both cases correctly triggered failover to the phone tether and correctly failed back once resolved, with the hysteresis genuinely holding rather than flapping.

One extra detail that matters for something like a Chromecast specifically: existing connections stay pinned to whichever path they started on during a failover event (that’s a deliberate feature of the underlying conntrack-based mechanism), while only *new* connections pick up the newly active path. You don’t want an active video stream’s TCP connection yanked mid-session just because the network underneath it changed.

## DNS that doesn’t stall for thirty seconds

This one was a genuine, measured incident, not a hypothetical. The DNS resolver’s default configuration used a single upstream server. The moment there was any disruption to the WAN connection — a failover event, or even just switching from one Wi-Fi network to another — any DNS query that wasn’t already cached would sit and wait the *full timeout* on that one upstream before giving up. Measured worst case: **thirty seconds** of a completely stalled-looking connection, even though the underlying network recovered in a couple of seconds.

The fix was straightforward once diagnosed: several diverse upstream resolvers instead of one, queried in parallel rather than sequentially (whichever answers first wins, slow or dead ones are simply ignored), and a much shorter per-query timeout as a worst-case ceiling. Re-tested against an actual forced network switch afterwards: worst-case query latency dropped from 30 seconds to 3 seconds, with the overwhelming majority of queries completing in under one second and never even noticing the switch happened.

The lesson generalises: a resilient WAN failover system built on top of a fragile single-point-of-failure DNS setup is not actually resilient. The weakest link in the chain determines the real-world outcome.

## Keeping the network itself boring under load

AdGuard Home — a well-established, self-hosted DNS filter — runs for every device on the private network, giving free ad and tracker blocking with no client-side configuration at all, since DHCP already tells every device to use the router as its DNS server. On top of that, both WAN paths run traffic shaping specifically tuned to control bufferbloat (the “everything gets laggy the moment something else starts downloading” problem) — using real measured link speed rather than guessed values, dialled in per connection since every venue’s actual bandwidth is different.

Admin services (SSH, the web admin panel, AdGuard Home’s own admin UI) are protected by a rate limit on new connections per source address — a direct response to an actual incident where an enthusiastic port scan from a laptop briefly overwhelmed the router’s own connection handling. Everything else on the router recovered instantly and was never actually affected, but it was still worth closing properly: the fix is scoped tightly enough that normal admin use is completely unaffected, while a scan or flood gets throttled hard.

A quick honest security check afterwards, run from an external client against both sides of the router: the private LAN exposes exactly the handful of services it’s supposed to and nothing else; the WAN-facing side exposes **nothing at all** — every one of a thousand probed ports came back closed. That’s the correct answer for a device that’s meant to sit invisibly on a stranger’s network.

## Home connectivity, the pragmatic way

The plan going in was ambitious: route *all* traffic from the private network back through a home VPN tunnel, for a consistent home-IP presence and access to home devices from anywhere.

Reality intervened. Getting a VPN tunnel to automatically become the default route for an entire network, cleanly, without racing the router’s own primary internet connection during start-up, turned out to be a genuinely gnarly problem — two separate mechanisms both trying to claim ownership of “the” default route at the same moment, in a way that left the router with no working internet at all, including on a fresh reboot. Diagnosed properly (down to confirming the Wi-Fi link itself was perfectly healthy throughout and the fault was purely in route installation), reverted cleanly, and set aside as a “build this properly later” project rather than something to keep iterating on live against a broken connection.

What actually got built instead, once put into perspective, is honestly the better fit for the real requirement: rather than tunnelling *everything* through home, the tunnel routes traffic to just the handful of specific home devices that actually need reaching remotely — a home server, the home router itself for emergency access, and a couple of others. Narrow, specific routes like that don’t compete with the primary internet connection for anything, so there’s no risk of the same conflict recurring, and it does precisely what was actually needed rather than what sounded impressive on paper. Hardened with an additional pre-shared key on top of the normal handshake for good measure.

Sometimes the right scope is smaller than the original plan, and that’s fine.

## Watching it work

Every meaningful signal is now logged continuously: CPU/memory/load, wireless signal strength per client, WAN interface traffic, and round-trip latency to the same targets the failover system itself watches — giving an independent trend line to sanity-check failover decisions against. None of this needed babysitting to set up “properly” — the goal was to have enough passive observability that a multi-day soak test just means *using the thing normally* and then reviewing the accumulated evidence afterwards, not staring at a terminal.

## What actually shipped

- Upstream Wi-Fi connection with automatic, health-checked failover to a phone-tether backup
- A private local network, filtered by AdGuard Home, with traffic shaping tuned per connection
- A dedicated Wi-Fi radio for the private network, physically separate from the upstream connection
- Connection-flood protection on admin services, verified with a live external exposure scan
- Resilient DNS that survives network switches in about a second instead of thirty
- Split-tunnel VPN access to specific home devices, without the fragility of a full site-wide tunnel
- Continuous health/performance logging for ongoing observability
- A written incident history for every non-obvious failure mode hit along the way, so none of them get silently reintroduced by a future config change or package update
- Total spend: **£24**, on a secondhand USB Wi-Fi adapter, because two old mini-PCs and a full-featured open-source router OS were already sitting in a drawer

The Chromecast is connected and streaming as of writing, from the same familiar private network it always joins. The final piece — a multi-day soak test under completely normal use, watching for anything that doesn’t recover cleanly on its own — is in progress now that every piece of the real end-state setup is actually in place.

------------------------------------------------------------------------

*Built on OpenWrt, on repurposed Beelink Mini-S hardware, using nothing more exotic than the packages already in the official repository. No vendor firmware, no cloud dependency, no subscription.*
