---
pubDatetime: 2023-11-12T15:20:29Z
title: "Domain Transfers"
tags:
  - "certificates"
  - "cloudflare"
  - "dns"
  - "Web"
heroImage: "/blog-media/2023/11/cloudflare.png"
description: "I wrote about moving my domains to Cloudflare - Certbot and Cloudflare , and thought I'd post a little about the experience as a reminder and a lesson to o"
---
I wrote about moving my domains to Cloudflare - [Certbot and Cloudflare](/posts/certbot-and-cloudflare/), and thought I'd post a little about the experience as a reminder and a lesson to others, who may also wish to move.

The main reason for my move was to allow me to do Dynamic DNS updates. This allows me to get certificates from Let's Encrypt for internal services that don't have an external DNS address. However, on moving the DNS management to Cloudflare, I also discovered that domain registration is actually much cheaper with Cloudflare than my existing registrar (namesco).

For a .net domain I paid £73 for 4 years (£18/year), and for a .co.uk domain I paid £48 for 3 years (£16/year). Cloudflare charged \$10.10 (£8.26/year) for the .net, and nothing to move the .co.uk. The .co.uk will cost \$4.71 (£3.85) at next renewal. That's a saving of near £10 for .net, and £13 for .co.uk.

There was one gotcha - namesco charged me £12 (£10+VAT) for each domain to be moved - just to release the TAG to Cloudflare. Cloudflare then charge a 1-year domain fee, and extend your domain for a year at the time of transfer. Whilst the savings are good, you will have to part with cash to make it happen.

Overall I felt it worth doing, it cost me a £12 each to move the registration. I didn't really have to do it for another 2 years, but I figured why not just do it now. The DNS hosting is free, so I could have left the registrar as namesco, and just change the DNS servers to Cloudflare, and it would have cost nothing.

> If nothing else, move your DNS hosting to Cloudflare today. Then move the registrar at/before renewal time.

- Not affiliated or funded in any way by Cloudflare
