---
pubDatetime: 2022-09-29T17:26:24Z
title: "WireGuard, OTP and ACL's"
tags:
  - "Linux"
  - "Networking"
  - "Security"
  - "vpn"
  - "wireguard"
heroImage: "/blog-media/2020/04/wireguard.png"
description: "Out of the box, WireGuard is a simple tool that solves a simple issue. Securely connect this system to that system. But what if that's not quite enough? If"
---
Out of the box, WireGuard is a simple tool that solves a simple issue. Securely connect this system to that system. But what if that's not quite enough? If a malicious actor obtains your WireGuard config then they are free to connect as you do!

In reality, your connection should still place restrictions on what you can access using whatever authentication mechanisms the remote network or system requires, place you into a mediation zone or take steps to ensure being connected isn't your only trust mechanism.

This is where [NHAS/Wag](https://github.com/NHAS/wag) comes in.

WAG provides a means of using a One Time Password (for Multi-factor Authentication) that works with WireGuard and the Linux eBPF firewall. This means I now require a public/private key pair to authenticate with WireGuard, but then I must provide a one time password from an authenticator phone app like [FreeOTP](https://freeotp.github.io) or Google Authenticator to enable the firewall to actually allow me on to something inside the network.

WAG manages your user registration process and sets up the WireGuard config ready for them. You can send them a link where they can obtain their configuration file, and when they first try to authenticate it even gives them the QR code to scan into the authenticator app.

The process is very simple.

1.  Register the user with WAG
2.  Send the user the registration link
3.  The user installs the WireGuard config they received
4.  The user connects with WireGuard
5.  The user visits the OTP page, eg. [http://otp](#) and enters the code from their phone
6.  If successful, WAG opens the firewall rules to allow the user access

## Access Control Lists

This is where the real magic is for me. Using a simple JSON file, you build a list of what groups you want with their members. Build a list of policies that allow users/groups access to what resources and if they are required to use MFA to access them.

```
{                                           
    "WgDevName": "wg0",                        
    "Lockout": 5,                           
    "HelpMail": "support@domain.tld",
    "ExternalAddress": "5.14.13.12",
    "DatabaseLocation": "devices.db",
    "MaxSessionLifetimeMinutes": 720,
    "SessionInactivityTimeoutMinutes": 60,
    "Issuer": "5.14.13.12",
    "DNS": ["10.0.0.254"],
    "Webserver": {                          
        "Public": {                            
            "ListenAddress": "10.0.0.72:80"
        },                                     
        "Tunnel": {              
            "ListenAddress": "192.168.254.1:80"
        }                        
    },                                
    "Acls": {                    
        "Groups": {                   
            "group:staff": [ 
                "paul",    
                "steve",
                "dominic"            
            ],                       
            "group:developers": [    
                "steve"                 
            ],                       
            "group:support": [       
                "paul"      
            ]                        
        },                           
        "Policies": {                
            "*": {                   
                "Allow": [           
                    "10.0.0.25"    
                ]                           
            },                                 
            "group:staff": {       
                "Mfa": [                       
                    "10.0.4.1/32",        
                    "10.0.4.2/32",          
                    "10.0.4.10/32"        
                ]                              
            },                              
            "paul": {           
                "Mfa": [                    
                    "10.0.4.123/32"           
                ]                           
            },                                 
            "group:developers": {     
                "Mfa": [             
                    "10.0.5.1/32"  
                ]                    
            },                        
            "group:users": {         
                "Mfa": [              
                    "0.0.0.0/0"      
                ]                    
            },                       
        }                            
    }                                
}            
```

You should find the structure fairly easy to understand. We have 3 groups with members in each, some in more than one group. We have policies that specify what groups, or users are allowed to access what IP addresses.

You start off with only being allowed access to the DNS server and the Web Server (which is the entry point for the OTP). Once you enter a one time password, the IP addresses that make up the policies that apply to your user open firewall rules to allow you to traverse the network.

This really was a great find. The developer is friendly and responsive. He's taken care of a few issues and listened to suggestions. It's very new, and we're beginning to roll this out to our users. For me, the solves the frustration of the [OpenVPN GUI missing OTP.](/posts/openvpn-gnome-network-manager-and-otp/) I look forward to making our remote connections easier to bear.
