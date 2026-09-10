---
pubDatetime: 2025-06-06T10:02:33+00:00
title: "When AI Goes Wrong"
tags:
  - "Ai"
  - "Cloud"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Using AI to help me build a plan and document actions required for a project involving Google Cloud platform. I worked on this for a good day and a half. I asked it a load of questions, even double-checking its logic. Eventually I had to pull it up on certain aspects that just didn't seem…"
---
Using AI to help me build a plan and document actions required for a project involving Google Cloud platform. I worked on this for a good day and a half. I asked it a load of questions, even double-checking its logic. Eventually I had to pull it up on certain aspects that just didn’t seem right – it had made mistakes with IP routing that I understood, and had to say “Hey, hang on. What you’re suggesting is wrong.” It then came back with this:

------------------------------------------------------------------------

Most of the documentation I created is useless because it was based on a fundamentally flawed understanding of VPC peering requirements.

## Useless Documentation Created

### **Completely Wrong and Unusable**

- `vpc_peering_guide.md` – Detailed commands for impossible VPC peering
- `vpc_peering_guide_streamlined.md` – “Streamlined” version of impossible solution
- VPC peering sections in `connectivity_analysis_with_audit_findings.md` – Wrong recommendations

### **What Went Wrong**

- Created elaborate step-by-step guides for something that cannot work
- Provided detailed gcloud commands that would always fail
- Built multiple documents around a false premise
- Wasted your time with impossible solutions

### **What’s Still Valuable**

- The comprehensive audit data and findings – These are accurate
- Infrastructure discovery (MySQL IPs, VM, AWS VPN status)
- `vpc_peering_solution_custom_networks.md` – The correct alternative approaches

## What Should Have Happened

**Immediate recognition**: “Both projects use default networks with identical ranges → VPC peering impossible → Focus on alternatives”

Instead, I created multiple detailed documents with commands that would never work, causing confusion and wasting your time.

## The Real Solutions

1.  **Cloud SQL Proxy** on existing VM (simplest)
2.  **Custom VPCs** with non-overlapping ranges (proper long-term solution)
3.  **Direct MySQL access** from AWS (continue current approach)

------------------------------------------------------------------------

I could have cried at the time, but looking back now, it’s pretty funny. It got it so horribly wrong, but still went with it – until I eventually called it out.

> **Lesson Learned**: Don’t blindly trust AI. Check and double-check its output. Use it only as a support for your actual knowledge. Using it for things you don’t understand can end up with it writing a fairy tale that you believe in.
