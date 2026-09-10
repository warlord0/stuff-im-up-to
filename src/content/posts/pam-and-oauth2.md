---
pubDatetime: 2021-01-13T21:01:48Z
modDatetime: 2023-04-21T17:50:01Z
title: "PAM and OAuth2"
tags:
  - "Linux"
  - "oauth2"
  - "Security"
  - "single-sign-on"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "We're looking for a way to get our remote users authenticating with the office systems whilst they are on the road, or in these troubled times working from"
---
We're looking for a way to get our remote users authenticating with the office systems whilst they are on the road, or in these troubled times working from home.

Not wanting to expose our LDAP to the internet it would be worth looking at using the existing Open Source OAuth2 solution we have - Keycloak.

It's just coincidental that one of our developers wanted to use Linux Manjaro, we're primarily a Debian based office with Debian and Linux Mint. It would probably have gone a bit smoother with Debian, but every now and then I like to get out of my comfort zone and in the past I've used Arch (Manjaro is an Arch based Linux) which I loved.

There doesn't seem to be too much around for using a module for PAM so I can login directly. The few I found I struggled with building and parameters that I had to guess at. I settled on [shimt/pam-exec-oauth2](https://github.com/shimt/pam-exec-oauth2). It had the necessary parameters and was pretty clear about how it worked.

First it requires `go`. A simple install with `apt` translates to an install with `pacman`.

```
sudo pacman -S go
```

Then follow the install guide.

The differences in installing to Manjaro are that the file `pam.d/common-auth` is replaced by `pam.d/system-auth`. Once you paste in the following line after the initial `auth required` line:

```
#%PAM-1.0

auth       required                    pam_faillock.so      preauth
auth sufficient pam_exec.so expose_authtok /opt/pam-exec-oauth2/pam-exec-oauth2
...
```

You should be good to go. If you don't use `sufficient` your local accounts won't work! You might want this, but remember to test it before changing it.

It's a bit chicken and egg here as you need a redirect url to put into Keycloak and you need the endpoint URL's from Keycloak. But go into Keycloak admin and create a new client in your realm. Give it an ID and ensure it is set as 'confidential'. Paste the following into the redirect URL:

```
urn:ietf:wg:oauth:2.0:oob
```

Save the config and go to credentials to copy the client secret that we'll need below.

Edit the file `/opt/pam-exec-oauth2/pam-exec-oauth2.yaml`

```
{
    client-id: "MyClientID",
    client-secret: "SuperSecretKey",
    redirect-url: "urn:ietf:wg:oauth:2.0:oob",
    scopes: ["email"],
    endpoint-auth-url: "https://sso.domain.tld/auth/realms/domain/protocol/openid-connect/auth",
    endpoint-token-url: "https://sso.domain.tld/auth/realms/domain/protocol/openid-connect/token",
    username-format: "%s",
}
```

Put in the details from your Keycloak client. Note I changes the `username-format` from the original to `"%s"`.

### The Trouble with Manjaro

What I discovered next was that the user account must exist in your passwd/shadow. I was hoping for an auto create based on successful logon, maybe that'll come later.

For all our users we use the pattern givenName.sn (or forename.surname). Manjaro has a filter that prevents username from containing a period/dot! This just won't do. I subverted this by creating the user with an underscore instead and then edited the passwd/shadow files to replace it. A bit naughty, but we don't suffer this on Debian.

Now the user is created. Create a home directory for them and give them permission. Create a `.zshrc` file for them:

```
# Use powerline
USE_POWERLINE="true"
# Source manjaro-zsh-configuration
if [[ -e /usr/share/zsh/manjaro-zsh-config ]]; then
  source /usr/share/zsh/manjaro-zsh-config
fi
# Use manjaro zsh prompt
if [[ -e /usr/share/zsh/manjaro-zsh-prompt ]]; then
  source /usr/share/zsh/manjaro-zsh-prompt
fi
```

Now you can logon.

We're nearly there. As I was writing this I went to use `sudo` and ... denied. A quick edit of `/etc/pam.d/sudo`

```
#%PAM-1.0

auth required pam_env.so
auth sufficient pam_exec.so expose_authtok /opt/pam-exec-oauth2/pam-exec-oauth2
...
```

Now `sudo` works too.

## References

https://github.com/shimt/pam-exec-oauth2
