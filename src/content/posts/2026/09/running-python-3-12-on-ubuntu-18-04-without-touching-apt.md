---
pubDatetime: 2026-09-30T13:48:38Z
title: "Running Python 3.12 on Ubuntu 18.04 without touching apt"
tags:
  - "python"
  - "ansible"
  - "ubuntu"
  - "vagrant"
heroImage: "/blog-media/2026/09/python-header.webp"
heroThumb: "/blog-media/2021/01/python-thumb.webp"
description: "A fleet of field devices stuck on Ubuntu 18.04 and Python 3.6.9 needed a business application requiring Python 3.10+. No OS upgrade, no apt, no compiler, no internet access from the device, and no changes to the system Python - built on the Ansible controller and pushed over the SSH connection already in place."
---

We had a fleet of small field devices still on Ubuntu 18.04, stuck there for reasons that had nothing to do with us. The system Python was **3.6.9**, which reached end of life in 2021. We needed to deploy a business application that requires **Python ≥ 3.10**.

Upgrading the OS wasn't an option. This post covers how we got a current Python onto those devices anyway: no apt, no compiler, no internet access from the device, and no changes to the system Python.

## Why the usual fixes didn't work

- **The code wouldn't even import.** It uses `dataclasses`, `X | None` unions, `list[str]` generics and `from __future__ import annotations`. On 3.6 those are syntax errors or `TypeError`s at import time, before any of your code runs.
- **apt was a dead end.** For our release, the `-updates` and `-security` pockets returned 404 from the mirrors the devices could reach. So there was no `python3.8` package, and a PPA wasn't an option either.
- **The devices' networks were unreliable.** They sit on customer networks that range from locked down to flaky. Some block GitHub. We couldn't rely on `git clone` or `pip install` from the device.
- **Backporting the app to 3.6** would have been a big rewrite of code that's otherwise modern and strictly typed. No thanks.
- **Even Ansible needed care.** ansible-core 2.17 and later can't run modules against a Python 3.6 target. We run the controller side with ansible-core 2.16, pinned on the fly:

  ```sh
  uvx --python 3.12 --from 'ansible-core<2.17' ansible-playbook ...
  ```

## The idea: build everything on the controller, copy it over

Ansible already has an SSH connection to every device, so everything the device needs goes down that connection:

```text
controller (staging dir)                                     device
───────────────────────────────────────────────────         ─────────────────────────────────
python.tar.gz   standalone CPython 3.12 (sha256 pinned) ──▶  /opt/myapp-python/   runtime
wheels/         manylinux2014 wheels, pinned versions   ──▶  venv: pip install --no-index
app.tar.gz      git archive <ref>                       ──▶  /opt/myapp/          app + venv
```

There are three parts.

### 1. A relocatable Python runtime

[python-build-standalone](https://github.com/astral-sh/python-build-standalone) publishes self-contained CPython builds. They're the same builds `uv` downloads when you ask it for a Python. The `install_only` tarballs:

- **run from any directory**, with no `./configure --prefix` and no compiler on the target;
- **only need glibc 2.17** for the `x86_64-unknown-linux-gnu` builds. Ubuntu 18.04 has 2.27, so there's plenty of headroom;
- **bundle their own OpenSSL, sqlite, zlib and friends**, so TLS doesn't depend on the old system OpenSSL.

`uv` will tell you the exact download URL, and each release publishes a `SHA256SUMS` file:

```sh
uv python list --show-urls --only-downloads | grep 'cpython-3.12.*-linux-x86_64-gnu '
```

### 2. An offline wheelhouse, built for the target, not the controller

`pip download` can fetch wheels for a platform and Python version other than the one it's running on. Asking for `manylinux2014` is the same as asking for glibc 2.17 compatibility, which matches the runtime:

```sh
pip download --only-binary=:all: \
  --platform manylinux2014_x86_64 --python-version 3.12 --implementation cp \
  -d wheels -r requirements.txt
```

`--only-binary=:all:` matters. It guarantees nothing has to be compiled on the device, and the download fails loudly on the controller if a package has no suitable wheel. Keep the requirement list to what the app actually imports on these devices. Ours dropped every heavyweight cloud and database client the app only needs elsewhere.

On the device, the bundled Python creates the venv (it ships with `ensurepip`), and pip installs only from the pushed wheels:

```sh
/opt/myapp-python/bin/python3 -m venv /opt/myapp
/opt/myapp/bin/pip install --no-index --find-links /opt/myapp-wheels -r /opt/myapp-wheels/requirements.txt
```

### 3. The app itself

We run `git archive` on a pinned ref from a checkout on the controller. There's no deploy key on the device and no GitHub access needed.

## The Ansible side

Here it is, trimmed down. Staging runs once per play on the controller:

```yaml
- name: Stage the bundle on the controller
  delegate_to: localhost
  run_once: true
  become: false
  check_mode: false # only writes to a local staging dir; keeps --check useful
  block:
    - name: Download the standalone Python build
      ansible.builtin.get_url:
        url: "{{ myapp_python_url }}"
        dest: "{{ stage }}/python.tar.gz"
        checksum: "sha256:{{ myapp_python_sha256 }}"
        mode: "0600"

    - name: Download the offline wheelhouse
      ansible.builtin.command:
        cmd: >-
          uvx pip download --only-binary=:all: --platform manylinux2014_x86_64
          --python-version 3.12 --implementation cp
          -d {{ stage }}/wheels -r {{ stage }}/requirements.txt
      changed_when: false

    - name: Resolve the app revision
      ansible.builtin.command: git -C {{ myapp_src }} rev-parse --verify {{ myapp_ref }}^{commit}
      register: myapp_rev
      changed_when: false

    - name: Archive the app
      ansible.builtin.command: git -C {{ myapp_src }} archive --format=tar.gz -o {{ stage }}/app.tar.gz {{ myapp_rev.stdout }}
      changed_when: false
```

On the device, a marker file records exactly what's installed: the Python checksum, the app revision and a hash of the pins. The bundle is only pushed again when one of those changes, so re-runs are quick and send nothing over a slow link:

```yaml
- name: Work out the bundle version
  ansible.builtin.set_fact:
    bundle_version: >-
      {{ myapp_python_sha256 }} {{ myapp_rev.stdout }}
      {{ myapp_requirements | join(',') | hash('sha256') }}

- name: Read the installed bundle version
  ansible.builtin.slurp:
    src: /opt/myapp/.bundle
  register: installed
  failed_when: false

- name: Decide whether to (re)install
  ansible.builtin.set_fact:
    needs_install: "{{ (installed.content | default('') | b64decode | trim) != (bundle_version | trim) }}"

# ...then, each with `when: needs_install | bool`:
#   unarchive python.tar.gz  -> /opt/myapp-python  (extra_opts: --strip-components=1)
#   unarchive app.tar.gz     -> /opt/myapp
#   copy wheels/             -> /opt/myapp-wheels/
#   python3 -m venv, pip install --no-index, remove the wheelhouse
#   write /opt/myapp/.bundle  (last, so a failed install is retried next run)
```

After that it's an ordinary app: an `.env`, a systemd service and timer, and `systemctl enable --now`. The system `python3` is never touched, so whatever else on the box depends on it keeps working.

## Proving it before touching a real device

We tested in three steps, each closer to a real device:

| Target                                                  | What it proved                                                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ubuntu:18.04` container with `--network none`            | The runtime runs on glibc 2.27, the venv installs fully offline, and the app runs                    |
| Ubuntu 18.04 container with systemd and Python 3.6        | The Ansible role works end to end, the second run reports `changed=0`, and the timer fires           |
| `generic/ubuntu1804` Vagrant VM, password SSH and sudo    | The full playbook runs like a real device, repeat runs change nothing, and there are no tracebacks   |

## Gotchas we hit

- **Don't combine `run_once` with a per-host `when`.** `run_once` runs on the first host in the batch. If that host happens to be skipped by its condition, staging is skipped for all hosts. Keep controller staging in its own block with no host condition.
- **Staging has to run under `--check`.** If it's skipped in check mode, dry runs of the device tasks have nothing to compare against. It only writes to a local directory, so `check_mode: false` is safe.
- **Write the marker last.** If an install fails halfway through, the next run notices and tries again.
- **Unpacking over an existing app directory keeps local files,** which is good for config. It also means files deleted upstream linger until you clean the directory out.
- **Don't mix `vagrant ssh` and Ansible when testing on a VM.** If your `ansible.cfg` shares SSH connections per host (e.g. `ControlPath=/tmp/ssh-control-%h`), connections from `vagrant ssh` and Ansible to the same IP as different users can reuse each other's master. Tasks then run as the wrong user. Close the shared connection (`ssh -S <path> -O exit x`) before switching.

## Why we like it

- **Nothing to install on the device first.** There's no apt, no compiler and no internet access needed: just SSH and about 25 MB, sent once.
- **Pinned and verifiable.** The runtime is pinned by checksum, the dependencies by version and the app by git revision.
- **Reversible.** Delete two directories and a unit file and the device is back as it was.
- **Reusable.** Any Python tool can use the same runtime with its own venv.

It's a bit mad that the easiest way to get Python 3.12 onto an Ubuntu 18.04 box was to not ask Ubuntu at all. But it works.
