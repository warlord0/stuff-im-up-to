---
pubDatetime: 2026-10-25T16:00:00Z
title: "I Was Wrong About Home Assistant"
heroImage: "/blog-media/2026/10/casa-header.webp"
heroThumb: "/blog-media/2026/10/casa-thumb.webp"
tags:
  - "home-assistant"
  - "dashboard"
  - "google-home"
  - "ai"
  - "claude"
description: "I always thought of Home Assistant as the red-headed stepchild of Google Home, with no real basis for it. I'd had it installed for ages and used it for small jobs Google couldn't do. Then I started asking more of it, and spent a day with Claude Code building a phone-first dashboard of bronze knobs, a dot-matrix display and push buttons. Here is why, what it looks like, and what went wrong on the way."
---

I have a confession to make. For years I thought of Home Assistant as the red-headed stepchild of Google Home. I had no basis for it. I'd never looked properly, and the idea was just there: Google was the polished one and Home Assistant was the fiddly thing on the side.

That's how I used it. It had been installed for a long time, and I treated it as a small solution to petty grievances, the jobs Google couldn't handle. Recently I started asking more of it. I stepped into the community, saw what people were building, and found out what it could really do. Home Assistant is the granddaddy of this whole arena, and next to it Google Home looks positively crippled.

This post is about what I did once I'd accepted that. I rebuilt the front end of my setup into something I like touching, and I'll cover what it looks like, why I wanted it, and where it went wrong.

## What I Wanted

My dashboards worked. They were also obviously Home Assistant. I'd themed them, and I liked the Aurel theme, but when I looked at the result my reaction was that it looked nice and was still just HA.

I didn't want a dashboard. I wanted something closer to an instrument, where the volume control feels like a volume control and the screen looks like it belongs on the front of an amplifier. The brief settled into a few rules. The look is dark and bronze, with serif type and brushed-metal knobs. The phone comes first, because it's the thing I actually pick up. Nothing may look like a stock card. And nothing may depend on the Home Assistant menu being visible, since I hide the header.

I built it with Claude Code, connected to my Home Assistant through the `ha-mcp` server. That let it read my real entities, write dashboards and deploy changes while I looked at screenshots on my phone and said what was wrong. Most of the work was that last part.

## Rooms

Each room is a page of knobs, one per light. Turn the ring to dim, and the glow around the page changes with what's on. The fan lights step through five brightness levels. The bedside switches are on/off knobs.

The small glowing dot at the corner of each knob opens a tray from the bottom of the screen. White lights get warmth and colour temperature there, and colour lights get hue and saturation. Dimming is one gesture, and the rarer controls are one tap further in.

![Three phones: the living room lights, the hue and saturation tray for a lamp, and the fan timer tray counting down from an hour](/blog-media/2026/10/casa-rooms.webp)

The fans sit below the lights, because I use the lights far more.

### The Fan Timer

The fans are infrared, so Home Assistant sends a command and never hears back. My first version also sent the fan's own timer codes. The interface couldn't tell when a timer was running, and what it showed drifted away from what the fan was doing. I wrote about the underlying problem in [Who Owns the State?](/posts/who-owns-the-state-my-ir-fans-behind-matter-hub/).

So Home Assistant owns the timer now. The tray has one, two and four hour buttons, a live countdown and a progress bar, and the dial itself gets a ring that shrinks as the time runs down. When the timer finishes, Home Assistant sends the off command. Cancelling it turns the fan off as well.

## Media

The media page took the most arguing. The living room is built around activities: Sky, Chromecast, Kodi, a PS5 and the smart TV, all through a Yamaha receiver.

My first version used a knob to pick the source. I rejected it straight away, because you don't know what you're selecting until you've turned it. I wanted push buttons, like an old stereo. Then I asked for a dot-matrix display like the one on the front of the Yamaha, in a matching gold, and Claude drew one on a canvas. It shows the source and the volume, and a second line that changes with what's happening: `SURROUND DECODER`, `SWITCHING`, or `USE CONTROLLER` for the PS5. With the smart TV selected it shows the app, so you get `NETFLIX` or `DISNEY+` instead of just `SMART TV`.

The volume control went through three designs.

![Three phones showing the same volume knob in three versions: small plus and minus keys under it, round buttons either side, and plus and minus inscribed into the ring itself](/blog-media/2026/10/casa-volume.webp)

I didn't like extra buttons next to a perfectly good knob, and I suggested putting a minus and a plus at each end of the ring. Claude's plan was to cut gaps into the ring and put the glyphs in them, rather than making buttons. I went with it, and on my phone it looked better than I'd imagined.

The volume is also capped on the receiver, between -50 dB and -20 dB, so a wild swipe can't do any damage.

The bedroom TV is a Sony I control over infrared through a Broadlink box. It has no volume readback, so its knob is an endless encoder that sends one step at a time. It uses the same look.

![Two phones: the living room media page with Sky selected and the remote pad coming into view, and the bedroom TV page](/blog-media/2026/10/casa-media.webp)

### Catch Up and Upcoming

Two older dashboard views moved across. **Catch Up** lists the episodes waiting for me, and tapping one plays it on Kodi. A spinner shows while it starts, then animated bars while it plays, and a pause icon if I pause it. **Upcoming** is my Sonarr and Radarr calendar grouped by day, with a filled gold dot for TV and a hollow one for films. Tapping a row opens the synopsis.

![Two phones: the Catch Up page with three episodes and play buttons, and the Upcoming page grouped by day](/blog-media/2026/10/casa-library.webp)

## Home

I gave the Home page a different look on purpose. The first version used the same brushed keys and dot-matrix display as the media pages, and I said it looked too much like a stereo. Heating and energy aren't things you press. They're things you read and nudge. So this page uses frosted panels and large serif numbers.

The thermostat is a knob, held between 10 and 26 °C. It only responds when the heating is in heat mode, and it can't switch the heating on by itself. Off and Heat are a sliding selector.

It has a heating timer like the fan one: tap the dot, pick one, two or four hours and watch the ring count down. A second automation cancels the timer if anything else turns the heating off first, so a stale timer can't switch it off later.

When the heating is running, the header shows an estimate, something like `Heating · ~25 min to 20.0°`. My thermostat doesn't report a time to target the way a Nest does, so the card works it out from how fast the room has been warming. It says `estimating…` until it has eight minutes of data, and it's a guess. I haven't yet seen it against a real heating run.

The energy panel shows the live draw as a big number, with a 24 hour trace under it, the current rate, and today's electricity and gas cost. The front door light is the same knob and tray as the room lights.

![Two phones: the heating knob and Off/Heat selector with the front door light below, and the front door light above the energy panel with its 24 hour trace](/blog-media/2026/10/casa-home.webp)

## Cameras

The camera page shows a tile for each camera, with a snapshot and a Live marker, and tapping one opens a full-screen view. The front door camera is a battery Google doorbell that only wakes on activity, so it often has no picture. That first gave me a broken-image icon. The tile now says "Asleep · no picture" and fills in when the doorbell wakes. It doesn't show the last picture it took, because an old shot of my front door passing as current would be worse than nothing.

## How It's Built

Each page is a custom Lovelace card, a plain web component in vanilla JavaScript with no framework and no build step. There are four files, covering rooms, media, home, and a library file for Catch Up, Upcoming and Cameras. They sit in the `www/` folder of the Home Assistant config and are registered as dashboard resources. Home Assistant caches `/local/` for a month, so each deploy bumps a version number on the resource URL.

Kiosk Mode hides the header, so the cards carry their own menu button and navigation buttons. I built everything on a test dashboard first and copied it to a live one when I was happy. That live dashboard isn't admin-only, so a non-admin account can use it.

The infrared devices, the fans and the bedroom TV, can't report their state, so the cards keep a held value. The card remembers what you pressed and holds it until the real state agrees, so a knob doesn't snap back while the device catches up.

## What Went Wrong

It wasn't a straight line.

Claude guessed entity IDs more than once, and the cards that used them failed with a 404. It now looks them up.

My heating system exposes a hot water entity, so a hot water panel got built. My boiler is a gas combi with hot water on demand, so there was nothing to control, and the panel is gone.

I asked for a front door light control and got a new slider in a different style, even though I already had a light control I liked. I asked why it had made a second one, and it replaced it with the real thing.

One card had a tray that worked in testing but ignored real taps, because the click handler never listed its buttons. Calling the function directly passed. Only a finger on the screen found it.

## How It Turned Out

I use these pages, and they do what I expect. The controls hold their state, the timers belong to Home Assistant, and every page can be reached from a button on the page.

I spent years thinking of Home Assistant as the lesser option. It turned out to be the platform that let me build exactly what I wanted, down to the pixels on a dot-matrix display. I couldn't have done any of this in Google Home.
