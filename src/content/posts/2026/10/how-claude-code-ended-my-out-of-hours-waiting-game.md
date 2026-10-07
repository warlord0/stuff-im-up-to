---
pubDatetime: 2026-10-07T13:23:15Z
title: "How Claude Code Ended My Out-of-Hours Waiting Game"
tags:
  - "ai"
  - "claude"
  - "ansible"
  - "systemd"
  - "cloudflare"
description: "Deploying to sites on the other side of the globe meant staying up out of hours, waiting for a late engineer and an unpredictable Cloudflare tunnel before I could rerun a playbook. Claude Code's first answer was a working cron job. It took two more rounds of pushback before the answer actually fit the problem."
heroImage: "/blog-media/2026/10/claude-header.webp"
heroThumb: "/blog-media/2026/10/claude-thumb.webp"
---

I've been helping our service team with deploying systems to sites on the other side of the globe, which in practice means doing it out of hours. One of their field engineers arrives on-site, fits the equipment, and powers it up. It connects out through a Cloudflare tunnel automatically, so I get a route in without needing any inbound access. My part is to rerun specific sections of the Ansible playbook that delivered the original build, since scripts almost always change in the time between shipping the equipment and it actually going live.

The annoying part was never the Ansible side - that's the bit I already had working. It was everything around it: sitting up waiting for a tunnel that might appear at any point in a multi-hour window, because engineers run late. So I asked Claude Code to solve the waiting instead.

## First Answer: a Cron Job

The first suggestion was reasonable on its own terms: a cron job that tries the site every five minutes, and once the tunnel answers, runs the playbook. That would have worked for a single ad-hoc deployment. But these aren't ad hoc - they're scheduled, two or three a day, sometimes a week apart. A cron ticking away every five minutes regardless of whether anything is actually due that day is wasteful for what's a handful of events a week, so I pushed back and gave it the constraint that actually mattered: I have a calendar of when each engineer is expected on site.

## Second Answer: Calendar-Aware, Still Polling

With the calendar fed in, Claude built a cron that checked it and only tried connecting around the scheduled appointments. Better, but it was still polling every five minutes to do that checking - just now with an extra step before deciding whether to bother. The shape of the solution hadn't actually changed, it had just gained a conditional.

## Third Answer: systemd Timers From the Calendar

The fix was to stop polling at all. I asked for the schedule to be read once a day, and for that daily run to create a `systemd` timer for every deployment due in the next 36 hours, each one using `--on-calendar=` so it fires at the exact scheduled time rather than on some arbitrary interval. The timers run in the remote device's own local timezone, so "9am on-site" means 9am there, not 9am wherever I happen to be.

Each timer retries from its scheduled start for three hours, which covers a late engineer without covering the whole day. Once the tunnel answers inside that window, it runs the playbook and the timer is done. One daily job turns the calendar into exactly the set of timers needed for the next day and a half, and nothing runs outside those windows at all.

One thing the scheduling didn't solve on its own: our tunnels sit behind Cloudflare Access with MFA, which is exactly what you want when a person is connecting, and exactly what breaks a timer firing at 3am with nobody there to approve a prompt. The fix was a Cloudflare Access service token scoped to just this automation, so the scripted connection authenticates without MFA while engineers and everyone else still goes through it as normal.

That token belongs to the script, not to Claude Code. At no point did Claude Code itself have access to the remote systems - its job was writing the automation that does, and the automation is something I can read, run, and audit on its own terms, same as I'd review a contractor's deployment script. The AI wrote the thing that holds the keys; it never held them.

The daily script also keeps its own state in a JSON file: which sites it's created timers for, and whether each one went on to succeed or fail. Without that, a site that never connects inside its three-hour window just silently drops off - the timer expires and there's nothing left to tell me it needs rerunning. With it, the next morning's check is reading one file to see what needs rework, not reconstructing it from `systemctl` and journal logs.

## A Couple of Snippets

Here's the daily planning step, sanitised but otherwise as it runs. It reads the calendar, skips anything already in a terminal state, and hands off a transient systemd unit for everything due within the next 36 hours:

```python
PLAN_HORIZON = timedelta(hours=36)  # schedule anything due this soon; next day's plan catches the rest
TIMEOUT_AFTER = timedelta(hours=3)  # give up polling a site this long past its slot

def plan(events, inventory_hosts, state, now):
    for ev in events:
        uid = ev["uid"]
        entry = state.get(uid)
        if entry and entry["status"] in TERMINAL_STATUSES:
            continue
        if ev["dtstart"] > now + PLAN_HORIZON:
            continue  # tomorrow's plan run will pick this up

        host, matched = resolve_host(ev, inventory_hosts)
        if not matched:
            state[uid] = {"status": "unmatched", "location": ev.get("location"), "ts": str(now)}
            continue

        fire_at = ev["dtstart"].strftime("%Y-%m-%d %H:%M:%S UTC")
        subprocess.run([
            "systemd-run", "--user", "--collect",
            f"--unit={unit_name_for(uid)}",
            f"--on-calendar={fire_at}",
            sys.executable, str(SCRIPTS_DIR / "deploy-watch.py"),
            "--run-one", uid,
        ])
        state[uid] = {"status": "scheduled", "host": host, "fire_at": fire_at}
```

And the part that each of those transient timers actually fires into - poll until reachable or until the three-hour window closes, then run and record the outcome:

```python
def run_one(uid, events, inventory_hosts, state):
    ev = next(e for e in events if e["uid"] == uid)
    host, matched = resolve_host(ev, inventory_hosts)

    deadline = ev["dtstart"] + TIMEOUT_AFTER
    while datetime.now(timezone.utc) < deadline:
        if ssh_reachable(host):
            ok, log_path = run_playbook(host)
            state = load_state()  # reload - avoid clobbering anything plan() wrote meanwhile
            state[uid] = {
                "status": "done" if ok else "failed",
                "host": host,
                "ts": str(datetime.now(timezone.utc)),
                "log": str(log_path),
            }
            save_state(state)
            return
        time.sleep(POLL_INTERVAL.total_seconds())

    state = load_state()
    state[uid] = {"status": "timeout", "host": host, "ts": str(datetime.now(timezone.utc))}
    save_state(state)
```

The reload-before-write in `run_one` matters more than it looks: each transient timer is its own process, so if two ever land close together, reloading the state file right before updating it means the later one doesn't silently overwrite whatever the earlier one just recorded.

## What Actually Changed

Now I don't wait up for any of it. I check the next morning, and the work is already done - or, if an engineer genuinely never turned up inside the three-hour window, I can see that too and chase it up instead of having sat there all night finding out the same thing in real time.

The interesting part wasn't that Claude Code produced a working answer on the first try. It did, and a cron job polling every five minutes genuinely would have worked. It just wasn't the right shape for two or three events a week scheduled well in advance - and that only became obvious once I said so. The working solution took three rounds, not because the first two were broken, but because I hadn't yet told it the one fact that mattered: this isn't a continuous problem, it's a scheduled one.
