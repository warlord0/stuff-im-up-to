---
pubDatetime: 2020-02-11T13:05:16Z
modDatetime: 2020-12-01T12:42:06Z
title: "Ansible"
tags:
  - "Linux"
description: "After working with Saltstack I thought I'd do some investigation with Ansible. I'm in the market for automation and want a simple means of delivering confi"
---
After working with Saltstack I thought I'd do some investigation with Ansible. I'm in the market for automation and want a simple means of delivering configuration onto our physical and virtual estate.

Nothing wrong with Saltstack - but broadening the view to Ansible shows it has one key feature that is very attractive. There is no need to install an agent - it uses ssh and will `sudo` or `su` to escalate privileges as required.

I've been working to get to the same point on both products, a client installed with my preferred environment with OhMyZsh, OS level authentication via our LDAP servers, my public key added to my account and password free use of sudo.

> Saltstack achieved this with a few entries in yaml files, and so does Ansible. Right now it's hard to pick a winner, so the agent/no-agent may be the decider.

I began using a playbook with Ansible and whilst it worked for what I was doing, I could see it getting a bit heavy. Then I investigated roles. This then becomes much more like Saltstacks pillar and grains with separate task files and a directory structure to build in.

Create your first role with:

```
$ ansible-role-init my-role
```

Now replaced with:

```
$ ansible-galaxy init my-role
```

It'll create a whole directory structure to build your role in. This was the missing piece in my jigsaw. Once the structure was created I could them build the role and use `import_playbook` and `import_tasks` to link everything together.

I created my roles in my own folder `~/ansible/roles`, so I didn't have to keep sudo'ing to edit the roles under the structure `/etc/ansible/roles`. By editing the `/etc/ansible/ansible.cfg` file you can give it alternative paths to reach your roles and edit them at your leisure with only user permissions.

So far using Ansible for configuration management seems very close to my experience with Saltstack. I can configure my hosts as expected, but I have found the use of the `debconf` module more frustrating as it's more input.

With Saltstack I can bundle all the debconf answers and values in one branch ,eg.

```
nullmailer-debconf:
  debconf.set:
    - name: nullmailer
    - data:
        'shared/mailname': {'type': 'string', 'value': 'server.domain.tld'}
        'nullmailer/relayhost': {'type': 'string', 'value': 'mail.domain.tld'}
```

With Ansible I'm having to create tasks for every question, which is more conversant, but I guess at least it's clearly readable.

```
  - name: Debconf shared/mailname
    debconf:
      name: nullmailer
      question: shared/mailname
      value: 'server.domain.tld'
      vtype: string
  - name: Debconf ullmailer/relayhost
    debconf:
      name: nullmailer
      question: nullmailer/relayhost
      value: 'mail.domain.tld'
      vtype: string    
```

The main thing I like Ansible for is the ability to manage an out of the box installation of Debian. As Debian doesn't come with `sudo` installed Ansible is capable of using `su` and processing your roles/tasks either way. Ironically I'm using Ansible to install and configure `sudo`.

### packages-tasks.yml

```
---
# file: packages-tasks.yml
# Install the base applications for the node
  - name: Install sudo, curl, git, zsh, ntp
    apt:
      name: "{{ packages }}"
      state: present
    vars:
      packages: 'sudo, curl, git, zsh, ntp'
  # Create the group wheel as any members of this can sudo without a password
  - name: Group wheel exists
    group:
      name: wheel
      state: present      
  # Allow password-less sudo access
  - name: Password-less sudo for wheel
    lineinfile:
      dest: /etc/sudoers
      state: present
      regexp: '^%wheel'
      line: '%wheel ALL=(ALL) NOPASSWD: ALL'
```

I copy in my public key to the root user `authorized_keys` so I can manage the host myself.

### authorized_keys-tasks.yml

```
---
  - name: Add sysadmin to wheel for sudo usage
    user:
      name: sysadmin
      state: present
      groups: wheel, sudo

  - name: authorized_keys for root
    authorized_key:
      user: root
      state: present
      key: "{{ lookup('file', 'mykey.pub') }}"
```

The big one is configuring the client to use the corporate LDAP server for authentication. It requires packages installing and configuration files modifying. All done with templates, files and variables.

### ldap-client-tasks.yml

```
---
  # Install and configure LDAP Client
  - name: Debconf nslcd/ldap-uris
    debconf:
      name: nslcd
      question: nslcd/ldap-uris
      value: '{{ ldap_uris }}'
      vtype: string
  - name: Debconf nslcd/ldap-base
    debconf:
      name: nslcd
      question: nslcd/ldap-base
      value: '{{ ldap_base }}'
      vtype: string     
  - name: Debconf nslcd/ldap-starttls
    debconf:
      name: nslcd
      question: nslcd/ldap-starttls
      value: u'{{ ldap_starttls }}'
      vtype: boolean     
  - name: Debconf nslcd/ldap-auth-type
    debconf:
      name: nslcd
      question: nslcd/ldap-auth-type
      value: '{{ ldap_auth_type }}'
      vtype: string
  - name: Debconf shared/ldapns/base-dn
    debconf:
      name: nslcd
      question: shared/ldapns/base-dn
      value: '{{ ldap_base }}'
      vtype: boolean

  - name: debconf libnss-ldapd/clean_nsswitch
    debconf:
      name: libnss-ldap
      question: libnss-ldapd/clean_nsswitch
      value: u'False'
      vtype: boolean
  - name: debconf libnss-ldapd/nsswitch
    debconf:
      name: libnss-ldap
      question: libnss-ldapd/nsswitch
      value: 'aliases, group, passwd, shadow'
      vtype: multiselect

  - name: debconf libpam-ldap/binddn
    debconf:
      name: libpam-ldap
      question: libpam-ldap/binddn
      value: '{{ ldap_bind_dn }}'
      vtype: string
  - name: debconf libpam-ldap/dblogin
    debconf:
      name: libpam-ldap
      question: libpam-ldap/dblogin
      value: u'False'
      vtype: boolean
  - name: debconf libpam-ldap/dbrootlogin
    debconf:
      name: libpam-ldap
      question: libpam-ldap/dbrootlogin
      value: u'False'
      vtype: boolean
  - name: debconf libpam-ldap/override
    debconf:
      name: libpam-ldap
      question: libpam-ldap/override
      value: u'True'
      vtype: boolean
  - name: debconf libpam-ldap/pam_password
    debconf:
      name: libpam-ldap
      question: libpam-ldap/pam_password
      value: exop
      vtype: string
  - name: debconf shared/ldapns/base-dn
    debconf:
      name: libpam-ldap
      question: shared/ldapns/base-dn
      value: '{{ ldap_base }}'
      vtype: string
  - name: debconf shared/ldapns/ldap-server
    debconf:
      name: libpam-ldap
      question: shared/ldapns/ldap-server
      value: '{{ ldap_uris }}'
      vtype: string
  - name: debconf shared/ldapns/ldap_version
    debconf:
      name: libpam-ldap
      question: shared/ldapns/ldap_version
      value: '3'
      vtype: string

  # Install packages
  - name: Install LDAP
    apt:
      name: ['libnss-ldapd', 'libpam-ldap', 'ldap-utils', 'sudo-ldap']
      state: present      

  - name: Modify nsswitch.conf
    copy:
      src: nsswitch.conf
      dest: /etc/nsswitch.conf
  - name: Remove auth_ok
    replace:
      path: /etc/pam.d/common-password
      regexp: '\sauth_ok'
  - name: Add mkhomedir.so
    lineinfile:
      path: /etc/pam.d/common-session
      line: 'session optional pam_mkhomedir.so skel=/etc/skel umask077'
      state: present
  - name: Configure ldap.conf
    template:
      src: ldap.conf.j2
      dest: /etc/ldap/ldap.conf
      owner: root
      group: root
      mode: u=rw,g=r,o=r
```

### templates/ldap.conf.j2

```
TLS_CACERT      /etc/ssl/certs/ca-certificates.crt
sudoers_base ou=SUDOers,{{ ldap_base }}
BASE {{ ldap_base }}
URI  {{ ldap_uris }}
```
