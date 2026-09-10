---
pubDatetime: 2020-03-04T09:38:24Z
title: "Ansible and Client Certificates"
tags:
  - "ansible"
  - "certificates"
  - "Linux"
heroImage: "/blog-media/2020/02/ansible800.png"
description: "Now we know how to inject client certificates into Firefox and Chrome it's time to automate that process with Ansible. The goal is to take a client and CA"
---
Now we know how to [inject client certificates into Firefox and Chrome](https://warlord0blog.wordpress.com/2020/02/05/firefox-certificates/) it's time to automate that process with Ansible.

The goal is to take a client and CA certificate and deliver it to the .pki keystore on the client. The actual generation of the certificate happens using `easyrsa` and is not part of this process. Let's assume you already have generated a series of certificates, and converted them to a `.pfx` (pkcs12) for each client and just need to deliver them - although I may write up that process later.

Further let's assume you are naming the certificate files with the same inventory hostname you are going to use in Ansible. This is so we can easily identify which file goes to which host, eg.

`myclient01.pfx` for inventory item `myclient01`.

I built my role structure with:

```
$ ansible-role-init certs
```

```
certs
├── defaults
├── files
├── handlers
├── meta
├── tasks
├── templates
├── tests
└── vars
```

I then copied my `.pfx` and `ca.crt` file into `files`.

## Protecting the Innocent

There is one part of this process that is going to require passwords for adding certificates to the `.pki` keystore on the client. As we don't like to keep plain-text passwords in any of our Git repositories I decided to use Ansible vault to protect them.

I found the easiest way to deal with the vault is to create a file in your `~/.ansible` folder called `secret` and put the plain-text password for your vault in there. This password will be used to encrypt data you put into your role and to decrypt it as it is deployed.

Then edit your `/etc/ansible/ansible.cfg` file and add a line to point to your password file:

```
vault_password_file = ~/.ansible/secret
```

I can then use it to create a variable with the password I used for my `.pfx` files called `easyrsa_secret`.

```
$ ansible-vault encrypt_string 'MySuperSecretKey' --name 'easyrsa_secret'
easyrsa_secret: !vault |
$ANSIBLE_VAULT;1.1;AES256
33616138643032396537383635313637393465343765633364306164363462373564666237316231
3565343837623334623564316439313936336437386435350a646434623163323137323135346334
30663430323262376435616465356366613739396333333634313139396538346136363833653766
6365626164336538360a626139303465386363316133636234376638633230653535623735326464
34316365646339643031663032326638326431613164323137383330313062623136
Encryption successful
```

Then copy the returned `easyrsa_secret` yaml snippet and put it into `vars/main.yml`. That's it! Now when I refer to the `{{ easyrsa_secret }}` in my role it will automatically be decrypted using my secret password, and my role is safe to commit to my repository.

> Just make sure you don't lose your `~/.ansible/secret` or you aren't going to be able to decrypt the values!

## Variables - vars/main.yml

```
---
easyrsa_pki: /home/easyrsa/pki/
easyrsa_secret: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          33303732313337343063363138383461663033316531356632303033323931346365613832383137
          3163393438616238633537353163346438663237313463310a326134356537323732313335633862
          33386639396336303563376338656461633365616361393339343061653433303832623835323830
          6534633537636133340a303732316334306233393230376463653465653532376434383830643238
          62363631663331383839653263386633646439613937643366323237313364613233
easyrsa_client_pki: /home/user/
```

`easyrsa_pki`, is the location I initialised/created my easyrsa pki structure.

`easyrsa_client_pki`, is the location on my remote client that holds the `.pki` keystore for Chrome/Firefox.

## Tasks - tasks/certificate-tasks.yml

```
---
# file: certificate-tasks.yml
- name: Install libnss3-tools
  apt:
    name: libnss3-tools
    state: present

- name: Copy Certificate to client
  copy:
    src: "files/{{ inventory_hostname }}.pfx"
    dest: "/tmp/{{ inventory_hostname }}.pfx"
- name: Copy CA Certificate to client
  copy:
    src: "files/ca.crt"
    dest: "/tmp/ca.crt"

- name: Create a file with the secret key in it
  lineinfile:
    path: /tmp/secret
    create: yes
    line: "{{ easyrsa_secret }}"

- name: Add the CA Certificate to the client .pki keystore
  command:
    chdir: /tmp
    cmd: "/usr/bin/certutil -A -i ca.crt -n MyCA -t \"CT,C,T\" -d {{ easyrsa_client_pki }}.pki -f secret"
  register: stdout

- name: Add the client .pkx public/private key pair to the client .pki keystore
  command:
    chdir: /tmp
    cmd: "/usr/bin/pk12util -i {{ inventory_hostname }}.pfx -n {{ inventory_hostname }} -d {{ easyrsa_client_pki }}.pki -w secret -k secret"

- name: Remove the secret and certificate files now we are done
  file:
    path:
      - /tmp/secret
      - /tmp/ca.crt
      - "/tmp/{{ inventory_hostname }}.pfx"
    state: absent
```

What happens here is Ansible will ensure the client has the tools required for certificate management by installing `libnss3-tools`. It will then copy the certificates to the clients `/tmp` folder and create a file containing the `secret` to use.

Next it will run `certutil` to inject the CA certificate and then `pk12util` to install the client public/private key pair. Before finally tidying up and removing the temporary files.
