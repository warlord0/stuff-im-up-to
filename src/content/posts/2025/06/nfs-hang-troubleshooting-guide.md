---
pubDatetime: 2025-06-22T12:24:31+00:00
title: "NFS Hang Troubleshooting Guide"
tags:
  - "Docker"
  - "Linux"
  - "Virtualisation"
  - "Nfs"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I've been struggling with a docker container that accesses my NAS using NFS mounts, it hangs and refusing to restart on demand. Turns out it's related to NFS mounts. I've been struggling to kill the process as it just sits there as a zombie. Symptoms ps aux command hangs and never completes Process stuck in…"
---
I’ve been struggling with a docker container that accesses my NAS using NFS mounts, it hangs and refusing to restart on demand. Turns out it’s related to NFS mounts. I’ve been struggling to kill the process as it just sits there as a zombie.

## Symptoms

- `ps aux` command hangs and never completes
- Process stuck in “D” state (uninterruptible sleep)
- `lsof` on the stuck process also hangs
- Repeated “hung task timeout” messages in dmesg
- Process cannot be killed with `kill -9`

## Root Cause

NFS mounts configured with “hard” option will wait indefinitely when the NFS server becomes unreachable. This causes processes accessing those mounts to enter an uninterruptible sleep state.

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

- `soft`: Operations fail after timeout instead of hanging indefinitely
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

## Notes

- Always use `timeout` command when testing potentially hung mounts
- Hard mounts are appropriate for critical data but require reliable networks
- Soft mounts can cause data corruption in some scenarios – use with caution
- Monitor NFS server health proactively to prevent these issues
