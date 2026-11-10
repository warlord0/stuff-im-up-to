---
pubDatetime: 2026-11-10T18:00:00Z
title: "A Turn-by-Turn Puck: OsmAnd, Bluetooth and a Round AMOLED"
heroImage: "/blog-media/2026/11/nav-puck-header.webp"
heroThumb: "/blog-media/2026/11/nav-puck-thumb.webp"
tags:
  - "esp32"
  - "navigation"
  - "osmand"
  - "bluetooth"
  - "diy"
description: "I wanted a little round screen that shows the next turn so my phone can stay in my pocket, on the e-bike or walking round Prague. Work in progress, but OsmAnd on the phone is already driving a 466x466 AMOLED over Bluetooth, and Google Maps turned out to be the wrong tool for the job."
---

I'm off to Prague next month and I want to walk round it with a navigation display that isn't my phone. The idea is a small round screen, on the handlebars of the Wisper or in a pocket on foot, that shows the next turn, the distance to it and not much else. It's nowhere near finished, but what's working already is better than I expected, so here's where it's got to.

## What It Is

The puck is a [Waveshare ESP32-S3-Touch-AMOLED-1.75C](https://docs.waveshare.com/ESP32-S3-Touch-AMOLED-1.75C): a 1.75 inch, 466x466 round AMOLED with an ESP32-S3, a battery charger and two buttons, in an aluminium case. The case is armour, not waterproofing, and I doubt it has any IP rating at all. I'll look for a silicone cover later.

The phone does all the thinking. OsmAnd plans the route and a small Android app of mine listens to what OsmAnd says, boils it down to one short line of text (turn type, distance, street name, time and distance remaining) and sends it to the puck over Bluetooth Low Energy. The puck just draws it.

The header photo is the puck waiting for a route, with the phone connected. This is the same device showing a live OsmAnd route:

![The puck on a cutting mat showing a white left-turn arrow, 130 yd, Turn left, Terry Road, a blue progress ring, 1 h 11 min, 2.6 mi, ETA 17:59 and a battery at 100% with a charging bolt](/blog-media/2026/11/nav-puck-live.webp)

Not a mock-up, and the screens below come from the simulator I built it with.

## The Screens

I built the display in a desktop simulator first, so I could render every case without walking down a road: junction types, roundabouts with the exit number, U-turns, metric versus miles, arriving, and so on. Same drawing code, then ported to the board. Arrows are drawn as arcs and lines rather than bitmaps, so they stay smooth and cost almost no memory.

![Six simulated round screens: turn right, roundabout take the 2nd exit, U-turn, a turn in metres and kilometres, a turn while charging, and a chequered flag for arrival](/blog-media/2026/11/nav-puck-screens.webp)

The blue ring is the progress to the next manoeuvre, which also fills in as the distance to the turn drops. The same screen holds the road number and street, ETA, remaining time and distance, and the puck's battery.

## It Needs a Bit More Than a Display

- **Pairing.** The first time, the puck shows a six digit code and you type it into the phone. After that it remembers the phone, so a stranger can't push their own directions onto it.
- **Sleep.** There's no point lighting an AMOLED for "straight on for a mile". A press of the BOOT button puts it to sleep and another wakes it, and a pocket mode wakes it by itself within about 150 metres of a turn.
- **Battery.** The built-in cell is tiny: 3.7V, 500mAh. Measured at the USB meter, the board draws about 0.5W however I fiddle with it, and neither screen off, a slower CPU nor Bluetooth made much difference, so expect roughly three hours on the internal cell. I limited charging to 200mA to be kind to it, and for a day out I'll use a power bank.
- **Compass.** A double press of BOOT shows a compass. The board has no magnetometer, so the phone's compass heading and GPS direction of travel are sent over the same Bluetooth link. I've only tested that at my desk, so a proper walk is next.

![Simulated compass screens pointing north and at 287 degrees, and the pairing screen showing a six digit code](/blog-media/2026/11/nav-puck-compass-pairing.webp)

## Why Not Google Maps?

I'd have preferred not to be tied to one app. I use Google Maps all the time, and it was the first thing I tried to make work. There are two ways in, and neither of them works for this.

**Reading its notification.** While Google Maps navigates it shows an ongoing notification, and an Android app can be allowed to read notifications. It gives you the distance and the street, and not much more. The direction of the turn is only in the little icon, which is a bitmap rather than a value, so I'd be guessing arrows from images. That breaks the next time Google redraws them.

**The Navigation SDK.** Google does offer a proper turn-by-turn feed, and it includes roundabout numbering. But it's part of the Navigation SDK, which means my own app does the navigating with Google's engine, rather than listening in on Google Maps. It's charged per destination, with a free allowance of 1,000 a month. For one person that's fine, but I couldn't confirm whether it works offline. That matters when you're on a roaming plan in another country, and I wasn't willing to build on a maybe.

Between them, Google Maps will tell me about turns, but not in a form I can rely on.

## Why OsmAnd?

OsmAnd has a proper interface for other apps. It hands over the turn type, the distance, the street, the roundabout exit, and the remaining time and distance, as values, not pictures. It also runs entirely from downloaded maps, so it doesn't need data to navigate.

The catch is the price. The free version limits how many maps you can download (I hit that at six), and the paid one is OsmAnd+ at £59.99 on Google Play, which is not cheap. I did check buying it elsewhere, but I'm told it loses features outside Play, and since Android Auto matters to me, I'll buy it through Play. Before I spend that I'll try it with the Czech map first.

The cost of this is that I've built something that currently only works with OsmAnd. I did look for a common standard that other navigation apps follow, and there isn't one. If I ever want to support another app, it would need its own adapter that produces the same short line of text for the puck. The puck doesn't care where the line came from.

## Where It Stands

It works, it looks good, and it reconnects on its own in about three seconds if the Bluetooth drops. The phone's screen can be off and it keeps going. Still to prove: the compass on a real walk, how the pocket mode behaves while I'm actually moving, and how long a power bank really lasts.

I'll write that up after Prague.
