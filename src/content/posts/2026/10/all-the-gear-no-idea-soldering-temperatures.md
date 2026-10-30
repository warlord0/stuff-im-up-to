---
pubDatetime: 2026-10-30T13:00:00Z
title: "All the Gear, No Idea: What I Was Getting Wrong About Soldering"
tags:
  - "electronics"
  - "soldering"
  - "tools"
heroThumb: "/blog-media/2026/10/soldering-thumb.webp"
description: "I don't solder often, and when I do it's always been bad - blobby joints, poor flow, the works. Today I found out why, almost by accident, watching a video about tip temperature. I'd been running my iron 100 degrees too cold for years."
---

I don't solder often, and every time I do I come away annoyed at how bad my joints look. Today I found out why, and it took one paused YouTube video and about thirty seconds of testing to prove it.

I was [watching this video](https://www.youtube.com/watch?v=jz67KgHzXVw) - it waffles a fair bit - and got to the part about tip temperature versus solder melting point. On screen was a chart of the presenter's favourite lead-free solders, each labelled with the tip temperature it needs:

![A chart of lead-free solder spools, each labelled with its recommended tip temperature: roughly 360, 335 and 330 degrees Celsius](/blog-media/2026/10/soldering-temps.webp)

My iron has always been set to 260°C. I was sure I'd read that was the melting point of lead-free solder somewhere, and the stuff melts at that setting, so it must be right. Except that's not what the chart was showing - those are the temperatures the *tip* needs to be for the joint to actually flow properly, and every one of them is comfortably over 300°C. Lead-free solder itself melts around 217°C, but the iron has to run well above that to get enough heat into the joint fast enough, especially once a ground plane or a bigger pad is pulling heat away from it. I'd been running mine over 100°C short of what it needed.

## Proof, Immediately

I'd been soldering that same morning, grumbling at how rough the joints were coming out. So instead of taking the video's word for it, I bumped the iron up and touched the new, much hotter tip to one of the bad joints I'd already made.

It turned into a tidy joint immediately. The pad took the heat properly and the solder flowed into a clean cone instead of sitting on top of the pin.

That's the tell the video had just explained: a cold joint doesn't fail to stick, it just sits there as a dull blob instead of wetting the pad.

![A red PCB with a row of header pins soldered along the top edge; one joint is circled in red, showing solder balled up on the pin instead of flowing into a smooth cone](/blog-media/2026/10/soldering-cold-joint.webp)

Every joint I'd ever been unhappy with looked exactly like the circled one. I'd just never had it explained what I was looking at.

## All the Gear, No Idea

The frustrating part is I'd actually kitted myself out properly, or thought I had: a solder station with digital temperature control, a brass wool tip cleaner, isopropyl alcohol for cleanup, and rosin flux. Temperature wasn't the only thing I was shortchanging.

I'd been applying flux with a rosin flux pen, the marker-pen style with a felt tip. I had no idea how little it was putting down until I started watching other people solder and noticed how wet their joints looked before the iron ever touched them - properly glossy with flux, not the faint smear mine got. I've since switched to flux in a syringe, which lands a generous, targeted amount exactly where the iron's about to go. Get the joint properly wet with flux and the iron at the right temperature, and the solder does almost all the work itself - it just flows into place.

Good tools, set to the wrong number, used too sparingly.

I'd also ordered leaded solder, since it's meant to flow more easily than the lead-free stuff, but the supplier cancelled the order - they'd only sell it to businesses, not individuals. So lead-free it stays, just run properly hot from now on.

Years of bad joints, and the whole time it was one number on a dial.
