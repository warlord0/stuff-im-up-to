---
pubDatetime: 2020-05-17T19:37:00Z
modDatetime: 2020-05-17T10:18:01Z
title: "SSH, OATH OTP and LDAP"
tags:
  - "ldap"
  - "Linux"
  - "oath"
  - "otp"
  - "Security"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "I got myself into a bit of a knot with this one. We wanted multi-factor authentication setup on the main SSH gateway and that meant private key, password A"
---
I got myself into a bit of a knot with this one. We wanted multi-factor authentication setup on the main SSH gateway and that meant private key, password AND OTP. Yes, a real belt and braces security approach.

What I found was that if I added in OATH to PAM that as soon as I entered the OTP I got logged in. Running ssh with `-vv` to get some verbosity I could see it was getting my private key - so technically I had achieved MFA or more precisely 2FA.

What I needed was to dig a bit deeper into the workings of PAM. Usually it's just a case of adding in the required PAM entries for LDAP and job done, now I had to figure out `required`, `requisite`, `sufficient` and the options like `[success=1...]`.

> Where possible it's best not to change the configuration files for `common-*` under `/etc/pam.d`, this is because they are included in many other pam files and may cause you to alter the authentication process for other methods causing yourself to be locked out.

The config file I'm interested in is `/etc/pam.d/sshd` which governs how our ssh logins are handled.

```
# OATH OTP One Time Password for FreeOTP/Yubikey
auth      required pam_oath.so debug usersfile=/etc/users.oath window=30 digits=6

# Standard Un*x authentication.
@include common-auth
...
```

From this snippet you can see I've included the `auth required` entry for `pam_oath.so` before the `@include common-auth`. This is VERY important for the flow through the process.

When you remove the comments, `common-auth` should include the following:

```
auth [success=2 default=ignore] pam_unix.so nullok_secure
auth [success=1 default=ignore] pam_ldap.so minimum_uid=1000 use_first_pass

auth requisite pam_deny.so

auth required pam_permit.so
```

When you join the two files together at the include it gives us a path which must be followed by the authentication process for ssh, this means that:

1.  Authentication for OATH OTP is "required" to succeed to continue the process
2.  Authentication for local `pam_unix` accounts will skip the next two lines if successful - so it will jump over LDAP and deny.
3.  Authentication for LDAP `pam_ldap` accounts will skip the next one line if successful - so it will jump over deny.
4.  If we ever reach `pam_deny` we will be denied access.
5.  If we ever reach `pam_permit` we are logged in successfully.

#### /etc/pam.d/common-account

I don't know when this piece of bad luck hit me, but it looked like all the above in `common-auth` should let me in. Which was fine for the authentication part of the process. I found that the `common-account` config didn't include the part to validate if I had an LDAP account! So I had to edit the `common-auth` file, despite me saying above not to.

```
account    [success=1 new_authtok_reqd=done default=ignore]   pam_unix.so
account requisite           pam_deny.so
account required            pam_permit.so
```

This one line verifies that I have a valid local account. If not I hit another deny! What I needed was the check to see if I had a valid LDAP account.

```
account    [success=2 new_authtok_reqd=done default=ignore]   pam_unix.so 
account [success=1 default=ignore] pam_ldap.so
account requisite           pam_deny.so
account required            pam_permit.so
```

Now if I don't have a local account I'll pass to the next check to see if I have a valid LDAP account. Notice the change in the `success` action, skip 2 lines if I have a valid local account and skip 1 line if I have a valid LDAP account.

> The biggest lesson I learned in this was it is very important to pay attention to the order of lines in the configuration files. They flow from top down in that exact order, even through the include files.

One thing really frustrated me, and maybe someone out there will know better, was the lack of OATH logging. I saw nothing in the `auth.log` about that process even with the `debug` option.

## ssh-askpass

With OTP and passwords being required, connecting seamlessly isn't as straight forward for graphical programs any more. When I tried to connect `virt-manager` to one of our internal servers it hung on attempting to connect, there was no prompt for OTP or password.

After a delay it actually popped up with the answer. It said to setup key authentication or install `ssh-askpass`. There are a few askpass packages so I opted for the Gnome version:

```
sudo apt install ssh-askpass-gnome
```

Then when I retry to connect to the server using `virt-manager` I get a dialog asking for the OATH OTP followed by the password.
