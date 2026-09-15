---
pubDatetime: 2026-09-15T14:17:23+00:00
title: "Zombie Docker Container"
tags:
  - "Docker"
  - "Linux"
  - "Troubleshooting"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.webp"
heroThumb: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico-thumb.webp"
description: "A Docker container can end up stuck in Up state while actually being dead inside — docker stop and docker kill both fail with 'did not receive an exit event', and the app inside is unresponsive. Here's the root cause and a script that recovers it…"
---

## Recovering a Docker Container Stuck in "Up" State

Every so often a container ends up in a state where `docker ps` insists it's `Up`, but nothing inside it actually works, and Docker itself refuses to stop it.

### The symptom

`docker stop` or `docker kill` fail with:

```text
Error response from daemon: cannot kill container: <name>: tried to kill
container, but did not receive an exit event
```

`docker ps` still shows the container as `Up`, but the application inside is unresponsive — the port refuses connections, and `curl` gets `Recv failure: Connection reset by peer`.

### The root cause

The process inside the container has actually died, but the `containerd-shim` process managing it never received the exit notification, so Docker's own bookkeeping still thinks it's running.

You can confirm this on the host:

```bash
ps aux | grep '<defunct>'
docker inspect <name> --format '{{.State.Pid}}'
```

If the PID Docker reports no longer exists in `/proc`, that's it — the container is a zombie. There's nothing left to signal cleanly, which is why the normal `docker stop`/`docker kill` commands can't do anything about it.

I first hit this with `servarr-sonarr-1` going full zombie — the Sonarr process showing as `[Sonarr] <defunct>` on the host while the container claimed `Up 2 days`. It's recurred enough since then that it was worth scripting the fix rather than working through it by hand each time.

### The fix

Find the `containerd-shim` process actually backing the container and force-kill it — that's what tears down the stale state — then recreate the container from its compose file.

```bash
#!/bin/bash
#
# Recovers a docker container that's stuck in "Up" state but is actually dead.
#
# SYMPTOM: `docker stop`/`docker kill` fail with:
#   "Error response from daemon: cannot kill container: <name>: tried to kill
#    container, but did not receive an exit event"
# `docker ps` still shows it as "Up", but the app inside is unresponsive
# (port refuses connections / curl gets "Recv failure: Connection reset by peer").
#
# ROOT CAUSE: the process inside the container has died (check with
# `ps aux | grep '<defunct>'` on the host, or `docker inspect <name> --format
# '{{.State.Pid}}'` pointing at a PID that no longer exists in /proc), but the
# containerd-shim process managing it never got the exit notification, so
# Docker's bookkeeping still thinks it's running. This leaves the container
# un-stoppable through normal docker commands because there's nothing left to
# signal cleanly.
#
# First observed with servarr-sonarr-1 on blackpearl going full zombie
# (Sonarr process shown as "[Sonarr] <defunct>" while the container claimed
# "Up 2 days") - recurring issue as of 2026-09-15.
#
# FIX: find the containerd-shim process backing the container, force-kill it
# (this is what actually tears down the stale state), then recreate the
# container from its compose file.
#
# Usage: unstick-container.sh <container-name> <compose-dir> [compose-service-name]
#   compose-service-name defaults to the container name's last path segment
#   if the container follows the <project>-<service>-<n> naming convention.
#
set -euo pipefail

CONTAINER="${1:?Usage: unstick-container.sh <container-name> <compose-dir> [service]}"
COMPOSE_DIR="${2:?Usage: unstick-container.sh <container-name> <compose-dir> [service]}"
SERVICE="${3:-}"

if [ -z "$SERVICE" ]; then
    # servarr-sonarr-1 -> sonarr
    SERVICE=$(echo "$CONTAINER" | sed -E 's/^[^-]+-(.+)-[0-9]+$/\1/')
fi

echo "== container state before =="
docker inspect "$CONTAINER" --format 'Status:{{.State.Status}} Pid:{{.State.Pid}}'

CID=$(docker inspect "$CONTAINER" --format '{{.Id}}')
SHIM_PID=$(ps aux | grep "containerd-shim-runc-v2 -namespace moby -id $CID" | grep -v grep | awk '{print $2}' || true)

if [ -z "$SHIM_PID" ]; then
    echo "No matching containerd-shim process found for $CONTAINER (Id=$CID)."
    echo "It may already be stopped, or the naming has changed - check manually with:"
    echo "  ps aux | grep containerd-shim"
    exit 1
fi

echo "Found containerd-shim PID $SHIM_PID for $CONTAINER - force-killing it."
sudo kill -9 "$SHIM_PID"

sleep 3
echo "== container state after shim kill =="
docker inspect "$CONTAINER" --format 'Status:{{.State.Status}} Pid:{{.State.Pid}}'

echo "== removing stale container record =="
docker rm "$CONTAINER" || true

echo "== recreating via compose (service: $SERVICE) =="
( cd "$COMPOSE_DIR" && docker compose up -d "$SERVICE" )

sleep 5
echo "== final state =="
docker ps -a --filter "name=$CONTAINER" --format 'table {{.Names}}\t{{.Status}}'
```

### Usage

```bash
unstick-container.sh <container-name> <compose-dir> [compose-service-name]
```

The service name defaults to the middle segment of the container name, assuming the usual `<project>-<service>-<n>` compose naming convention — so `servarr-sonarr-1` resolves to a service name of `sonarr` without needing to pass it explicitly. Pass it as a third argument if your naming doesn't follow that pattern.

### Why this works, and `docker restart` doesn't

`docker restart` (and `stop`/`kill`) all go through the same clean-shutdown path, which relies on the shim being able to signal the container's process and observe it exit. When that handshake is broken, none of them can do anything — they all fail the same way, for the same reason.

Force-killing the shim directly sidesteps that entirely: it doesn't ask the shim to do anything, it just removes it, which is enough for Docker to notice the container is gone and let you clean up the stale record with `docker rm`. From there, `docker compose up -d` just recreates the service as normal.
