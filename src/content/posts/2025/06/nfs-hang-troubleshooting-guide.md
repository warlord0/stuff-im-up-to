---
pubDatetime: 2025-06-22T12:24:31+00:00
modDatetime: 2026-09-21T21:30:00Z
title: "NFS Hang Troubleshooting Guide"
tags:
  - "Docker"
  - "Kernel"
  - "Linux"
  - "Virtualisation"
  - "Nfs"
heroImage: "/blog-media/2026/09/nfs-hang-header.webp"
heroThumb: "/blog-media/2021/01/manjaro-thumb.webp"
description: "I've been struggling with a docker container that accesses my NAS using NFS mounts, it hangs and refusing to restart on demand. Turns out it's related to NFS mounts. I've been struggling to kill the process as it just sits there as a zombie. Symptoms ps aux command hangs and never completes Process stuck in…"
---
I’ve been struggling with a docker container that accesses my NAS using NFS mounts, it hangs and refusing to restart on demand. Turns out it’s related to NFS mounts. I’ve been struggling to kill the process as it just sits there as a zombie.

> **Update, September 2026:** it happened again, on mounts that were already `soft`, so the fix below is not the whole story. There is a second failure mode, a stalled write-back inside the NFS client kernel, and it looks quite different. See [Update: when soft mounts are not enough](#update-when-soft-mounts-are-not-enough) at the bottom.

## Symptoms

- `ps aux` command hangs and never completes
- Process stuck in “D” state (uninterruptible sleep)
- `lsof` on the stuck process also hangs
- Repeated “hung task timeout” messages in dmesg
- Process cannot be killed with `kill -9`

## Root Cause

NFS mounts configured with “hard” option will wait indefinitely when the NFS server becomes unreachable. This causes processes accessing those mounts to enter an uninterruptible sleep state.

That is one cause. A second one hangs even with `soft` mounts and a perfectly healthy server; it is described in the update at the bottom.

## Immediate Diagnosis Steps

### 1. Identify the stuck process

```
# Run ps with strace to see where it hangs
sudo strace -e trace=openat,read ps aux
```

Look for hanging on `/proc/[PID]/environ` or similar files.

### 2. Check for hung task messages

```
sudo dmesg | grep -i "hung task\|timeout" | tail -10
```

### 3. Identify NFS mounts and server connectivity

```
# List NFS mounts
mount | grep nfs

# Test NFS server connectivity (replace with your server IP)
ping -c 3 192.168.0.3

# Check NFS exports (may hang if server is down)
timeout 10 showmount -e 192.168.0.3

# Test mount accessibility (use timeout to prevent hanging)
timeout 5 ls /mnt/Comics
timeout 5 ls /mnt/History
timeout 5 ls /mnt/Video
```

## Resolution Steps

### 1. Stop systemd automount services (if using automount)

```
sudo systemctl stop mnt-Comics.automount
sudo systemctl stop mnt-History.automount  
sudo systemctl stop mnt-Video.automount
```

### 2. Force unmount NFS shares

```
# Try force unmount first
sudo umount -f /mnt/Comics
sudo umount -f /mnt/History
sudo umount -f /mnt/Video

# If force doesn't work, try lazy unmount
sudo umount -l /mnt/Comics
sudo umount -l /mnt/History
sudo umount -l /mnt/Video
```

### 3. Kill the stuck process

```
# Should now work after unmounting
sudo kill -9 [PID]
```

### 4. Verify ps works again

```
ps aux | head -5
```

### 5. Restart automount services when NFS server is back online

```
sudo systemctl start mnt-Comics.automount
sudo systemctl start mnt-History.automount
sudo systemctl start mnt-Video.automount
```

## Prevention

### Update fstab with better NFS options

Edit `/etc/fstab` to include `soft` mount options and reasonable timeouts:

**Before (problematic):**

```
192.168.0.3:/volume1/Video /mnt/Video nfs noauto,nofail,x-systemd.automount,_netdev 0 0
```

**After (recommended):**

```
192.168.0.3:/volume1/Video /mnt/Video nfs noauto,nofail,x-systemd.automount,_netdev,soft,timeo=30,retrans=2 0 0
```

### Key NFS mount options explained:

- `soft`: Operations fail after timeout instead of hanging indefinitely (this bounds RPC timeouts only; it did not prevent the write-back stall described in the update below)
- `timeo=30`: Timeout after 3 seconds (in tenths of a second)
- `retrans=2`: Retry operation 2 times before failing
- `intr`: Allow interruption of hung operations (older kernels)

### Alternative: Use autofs for better timeout handling

Consider switching from systemd automount to autofs for more robust NFS handling.

## Emergency Commands Reference

```
# Quick diagnostic
sudo dmesg | tail -20
mount | grep nfs
ping -c 3 [NFS_SERVER_IP]

# Emergency unmount all NFS
sudo umount -a -t nfs -f

# Nuclear option: lazy unmount everything
sudo umount -a -t nfs -l

# Find processes using NFS mounts (may hang)
timeout 10 sudo lsof | grep /mnt
```

## When to Reboot

If unmounting fails and processes remain unkillable, a reboot may be necessary. This typically happens when:

- Hardware I/O is completely stuck
- Kernel threads are affected
- Multiple processes are in uninterruptible sleep

## Update: when soft mounts are not enough

Over a year later the same setup hung again, but it looked different, and every fix above was already in place (`soft`, sensible timeouts).

### What it looked like

- A container reported “Up” but its app was dead and the web UI refused connections
- `docker stop` and `docker kill` failed with `tried to kill container, but did not receive an exit event`
- On the host the app showed as `[app] <defunct>`, yet `ps` itself worked fine
- The mount itself answered `stat` and `df` instantly; only certain files hung

The clue is that only *one thread* was stuck. A process with a thread in uninterruptible sleep cannot finish exiting, so the leader turns into a zombie and the container runtime never receives its exit event.

### Find the stuck thread

`ps aux` shows processes, not threads, so look at threads:

```
ps -eLo pid,tid,stat,wchan:32,etimes,comm | awk 'NR==1 || $3 ~ /^D/'
sudo cat /proc/PID/task/TID/stack
```

In my case the stack was:

```
folio_wait_writeback
filemap_write_and_wait_range
nfs_wb_all  [nfs]
nfs_setattr [nfs]
vfs_utimes
__x64_sys_utimensat
```

In other words: the application had copied a large file to the NAS, then tried to set its modification time (`utimensat`), and the kernel was waiting for the file's dirty pages to finish writing back. They never did. Anything else that touches that file can hang too, because the client flushes dirty pages before it answers, which matches what I saw: `ls` on the affected files hung while the mount as a whole did not.

The kernel logs this as well, with two gotchas:

- `journalctl -k` only shows the **current boot**. Use `journalctl -k -b -1` for the previous one, and check `journalctl --list-boots` (the journal has to be persistent for older boots to exist).
- `kernel.hung_task_warnings` defaults to 10, and one stuck task used them all up in about twenty minutes, hiding everything after it. Raise it: `sudo sysctl -w kernel.hung_task_warnings=50`.

### Stuck, or just busy?

A thread in the middle of a long, healthy copy is also in `D` state much of the time. Two samples tell them apart:

```
grep voluntary_ctxt_switches /proc/PID/task/TID/status   # run twice, 60-90 seconds apart
```

A busy thread’s counter keeps climbing; a stuck thread’s is frozen.

### Client problem or NAS problem?

Compare these while it is stuck:

```
ss -tin dst NAS_IP:2049                       # Send-Q and Recv-Q both 0 = nothing queued on the wire
grep -E '^(Dirty|Writeback):' /proc/meminfo   # Writeback stuck above 0 while idle
# /proc/self/mountstats: per-op counters for the mount, sampled 15 seconds apart
```

Mine showed an idle connection, no WRITE or COMMIT calls at all in the window (only lease renewals), a few hundred kB stuck in `Writeback`, and an idle, healthy NAS (RAID clean, no disk I/O). That points at the *client kernel* losing a write-back completion, not at the server. It also ruled out my first theory, an orphaned NFSv4 lock left behind by force-killing containers: the stall had started before I had killed anything, and it happened again on a freshly started container.

### Clearing it

Once the stall is confirmed, resetting the client’s mount state clears it:

```
sudo umount -f -l /mnt/Video     # lazy and forced; touch the path afterwards so automount re-mounts it
```

Then restart the containers that use the mount. If `docker stop` fails, the `containerd-shim` process for that container can be killed directly. That fixes Docker’s bookkeeping but not the stuck thread; the remount does that.

### Catching it automatically

Waiting to notice cost me days. A small hourly watchdog now does the diagnosis above instead of remounting blindly: it lists `D`-state threads whose kernel stack mentions NFS, samples them twice, and only acts if the same thread’s context-switch counter has not moved. It then saves the stacks to a log first, remounts only the affected mount, and restarts only the containers that use it. A minimal detector:

```
#!/bin/bash
# prints "pid tid vcs comm" for threads waiting in NFS code
nfs_waiters() {
  ps -eLo pid=,tid=,stat=,wchan:32=,comm= | while read -r pid tid stat wchan comm; do
    case "$stat" in D*) ;; *) continue ;; esac
    stack=$(sudo cat /proc/$pid/task/$tid/stack 2>/dev/null)
    [[ "$wchan $stack" =~ nfs|rpc ]] || continue
    echo "$pid $tid $(awk '/^voluntary_ctxt_switches/ {print $2}' /proc/$pid/task/$tid/status) $comm"
  done
}
first=$(nfs_waiters); sleep 90; second=$(nfs_waiters)
# a line present and identical in both samples = stuck, with no progress
comm -12 <(echo "$first" | sort) <(echo "$second" | sort)
```

Nightly image updates then tripped over it: recreating a container that cannot be stopped fails halfway and leaves a half-created one behind (a temporary hash-prefixed name, attached to no network). I gated the update job with a systemd drop-in whose `ExecStartPre` refuses to run while an NFS stall is present.

### Is it the kernel?

Possibly. The journal shows this stall in every boot since I moved to the 7.1 kernel series and in none of the one earlier boot it still holds. That is a short window, so it is correlation, not proof. I found several 2026 NFS write-back fixes on the [linux-nfs list](https://ratatoskr.run/linux-nfs/2026/04/16643382), but none matching this exact symptom (a thread waiting on a page with nothing in flight). I am trialling 7.2, with LTS kernels installed as the fallback, and will update this post with the result.

Two practical notes from doing that on Manjaro:

- To see what is available without risking a partial upgrade, sync into a throwaway database instead of the real one: copy `/var/lib/pacman/local` to a temporary directory and run `sudo pacman -Sy --dbpath /tmp/thatdir`. Then install with a full `pacman -Syu <kernel>`.
- `grub-reboot` is meant to boot an entry once. With `GRUB_DEFAULT=saved` and `GRUB_SAVEDEFAULT=true`, mine still overwrote the saved default with the new kernel. Check with `grub-editenv list` afterwards rather than relying on it as a safety net.

### Dead ends worth knowing about

- A NAS-side `nfsd: failed to write recovery record (err -17)` message looked promising. It was unrelated: wrong time, and `-17` only means “already exists”.
- `soft` mounts do not help here. They bound RPC timeouts, not a write-back that never completes.
- Enabling NFSv4.1 would be the obvious next experiment, but my NAS only offered v4.0.

## Notes

- Always use `timeout` command when testing potentially hung mounts
- Hard mounts are appropriate for critical data but require reliable networks
- Soft mounts can cause data corruption in some scenarios – use with caution
- Monitor NFS server health proactively to prevent these issues
