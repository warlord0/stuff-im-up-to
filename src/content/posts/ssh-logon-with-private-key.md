---
pubDatetime: 2017-03-01T10:58:31Z
modDatetime: 2017-03-05T16:33:41Z
title: "SSH Logon with Private Key"
tags:
  - "Linux"
  - "ssh"
description: "There are a number of ways to configure authentication in Linux, you can even use Windows credentials. But generally, for SSH, I find it easier to just use"
---
There are a number of ways to configure authentication in Linux, you can even use Windows credentials. But generally, for SSH, I find it easier to just use a private key that is trusted on all my servers. This way I only need to know the password to use the key, and not the password for the account on the server. The process involves owning a private key on your own client system. That can be a Linux system or Windows and putty. Anything that can use the private key can logon to the Linux server without knowing the servers password. You can use puttygen on windows to create a private key, but generally I tend to use a Linux system for this. However you do it, you need to be able to copy the public part of the key and put it into the `~/.ssh/authorized_keys` file.

## Creating a key pair in Linux

Run `ssh-keygen` and specify a password/passphrase for the private key. If you don't specify a password you'll be able to logon to the remote server without specifying one! Which can be very handy if you need to connect an automated process without a password. Let it store these as the default names `id_rsa` and `id_rsa.pub`. These are the private key and public key.

    $ ssh-keygen 
    Generating public/private rsa key pair.
    Enter file in which to save the key (/home/USER/.ssh/id_rsa): 
    Enter passphrase (empty for no passphrase): 
    Enter same passphrase again: 
    Your identification has been saved in /home/USER/.ssh/id_rsa.
    Your public key has been saved in /home/USER/.ssh/id_rsa.pub.
    The key fingerprint is:
    84:3d:86:74:d2:e3:95:06:a4:71:a6:61:cc:6c:e4:d6 USER@MACHINE
    The key's randomart image is:
    +---[RSA 2048]----+
    |                 |
    |       .         |
    |      . .        |
    |     + .         |
    | .  * B S        |
    |* .. O =         |
    |oO+E  =          |
    |+*   .           |
    |.                |
    +-----------------+

## Getting the Remote Server to Trust your Key

Once you have these two files you just need to add the contents of your id_rsa.pub file to the remote servers `~/.ssh/authorized_keys` file for the user account you want to logon as, eg. root = `/root/.ssh/authorized_keys` You may have more than one key in the file, which is why I say add yours to it. If you don't have a file then you can simply copy the `id_rsa.pub` file to create it. The user you want to logon as must have permission to the authorized_keys file. So if you create it make sure you allow them to read it. I tend to copy the public key onto the remote server with scp and then logon to the remote server (using a traditional password logon) and then add the key to the users authorized_keys.

    $ scp ~/.ssh/id_rsa.pub USERNAME@SERVER:~/mykey.pub
    $ ssh USERNAME@SERVER
    $ cat ~/mykey.pub >> ~/.ssh/authorized.keys
    $ chown USERNAME ~/.ssh/authorized.keys
    $ chmod 600 ~/.ssh/authorized.keys

Now you should be able to logout from the remote server (CTRL-D) and logon using your new private key.

    $ ssh -i ~/.ssh/id_rsa USERNAME@SERVER

Use the password you specified for your private key and you should get connected.

## Making Things Easier

Rather than having to specify the identity file to use each time you use ssh you can automate this by creating a `~/.ssh/config` file with the following contents:

    Host *
      IdentityFile ~/.ssh/id_rsa
      User root

Where this specifies for any host you connect to use the specified identity file and the user account `root`. So a simple `ssh SERVER `is all that's required. It will automatically use the id_rsa file and the user root. You can expand on this if you connect to various hosts and the user account is different on some hosts add more entries like:

    Host printserver
      User printadmin

This would be equivalent to:

    $ ssh -i ~/.ssh/id_rsa printadmin@printserver

When all I actually type is:

    $ ssh printserver

   

## References

[https://www.debian.org/devel/passwordlessssh](https://www.debian.org/devel/passwordlessssh) [https://linux.die.net/man/5/ssh_config](https://linux.die.net/man/5/ssh_config)
