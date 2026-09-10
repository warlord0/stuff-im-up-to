---
pubDatetime: 2014-02-18T14:34:43Z
modDatetime: 2016-11-07T15:13:09Z
title: "Squid Proxy"
tags:
  - "Linux"
  - "Security"
  - "squid"
  - "Web"
heroImage: "/blog-media/2014/02/caching-proxy-squid-3-4-2-now-available-for-download-413893-2.png"
description: "We have a few special requirements in our network. For internet based traffic we use an appliance based proxy server that users must authenticate with to g"
---
We have a few special requirements in our network. For internet based traffic we use an appliance based proxy server that users must authenticate with to get out to the internet. But we also use an internal proxy server to access a secure network. In order to do this rather than buying another appliance we setup a Squid proxy on a Linux server. In order to achieve the results required we need to tell the clients how to request pages and from where. This is done using WPAD which is dished out using DHCP, DNS and GPO. So within the client browser if a page meeting the specified criteria is selected it goes to the relevant proxy.

### WPAD.DAT

    var local = new Array();  // Array for LOCAL networks
    var bypass = new Array(); // Array for URLs to bypass the proxy (DIRECT)
    var secure = new Array(); // Array for URLs located within the SECURE network

    local[local.length] = "192.168.0.0,255.255.255.0"; // Server range
    local[local.length] = "192.168.1.0,255.255.255.0"; // Printer range

    // Add URLs in the same format as below.
    //  Use * as wildcard
    bypass[bypass.length] = "*.mydomain.local:*/*";
    bypass[bypass.length] = "https://noproxy.domain.tld/*";

    // Domains to pass through to the SECURE Proxy
    // These are not wildcards like URLs
    secure[secure.length] = ".secure.uk";

    var proxy = "[internet_proxy:8080]"; // Set this to the address of the Internet proxy
    var secureproxy = "[squid_proxy:3128]";    // Set this to the address of the SQUID Proxy - Must be FQDN for Authentication to Work
    var localDomain = ".mydomain.local"; // Set this to the local domain name with leading dot (.)
     
    // You should not need to change anything below here
     
    function FindProxyForURL(url, host) {
      /*
      Return Value Format
      The JavaScript function returns a single string.
      If the string is null, no proxies should be used.
      The string can contain any number of the following building blocks, separated by a semicolon:
     
      DIRECT
        Connections should be made directly, without any proxies.
      PROXY host:port
        The specified proxy should be used.
      SOCKS host:port
        The specified SOCKS server should be used.
      */
     
      // If host has no dots OR is localDomain go direct
      if (isPlainHostName(host) || dnsDomainIs(host, localDomain)) {
        return "DIRECT";// + " (local) "+host;
      }
     
      // our local URLs from those listed in "bypass" don't need a proxy.
      for (i=0; i<bypass.length; i++) {
        if (shExpMatch(url, bypass[i])) {
          return "DIRECT"; // + " "+bypass[i];
        }
      }
     
      // URLs within the networks listed in "local" are accessed directly
      for (i=0; i<local.length; i++) {
        if (local[i].indexOf(",") > -1) {
          net = local[i].split(",");
          if (isInNet(host, net[0], net[1])) {
            return "DIRECT";// + " "+net[0];
          }
        }
      }
     
      // URLs within the networks listed in "secure" are accessed via the secure Proxy
      for (i=0; i<secure.length; i++) {
        if (dnsDomainIs(host, secure[i])) {
          return "PROXY " + secureproxy + "; PROXY " + proxy;
        }
      }
       
      // All other requests go through "proxy".
      // should that fail to respond, go direct.
      return "PROXY " + proxy; // + "; DIRECT";
    }

Simplistically we use 3 array variables, local - for our internal servers, bypass - for server that don't go via any proxy and secure - for servers that are on the secure domain.

### SQUID.CONF

The Squid server is then configured to allow only those client that meet specific criteria to pass through to the secure network.

    ### /etc/squid3/squid.conf Configuration File ####

    ### cache manager
    cache deny all
    cache_mgr cache_mgr@mydomain.gov.uk

    auth_param negotiate program /usr/lib/squid3/squid_kerb_auth -d
    auth_param negotiate children 10
    auth_param negotiate keep_alive on

    ### pure ntlm authentication
    auth_param ntlm program /usr/bin/ntlm_auth --diagnostics --helper-protocol=squid-2.5-ntlmssp --domain=MYDOMAIN
    auth_param ntlm children 10
    auth_param ntlm keep_alive off

    ### provide basic authentication via ldap for clients not authenticated via kerberos/ntlm
    auth_param basic program /usr/lib/squid3/squid_ldap_auth -R -b "dc=mydomain,dc=local" -D squid@mydomain.local -W /etc/squid3/ldappass.txt -f sAMAccountName=%s -h ldap.mydomain.local
    auth_param basic children 10
    auth_param basic realm Internet Proxy
    auth_param basic credentialsttl 1 minute

    ### ldap authorisation
    external_acl_type memberof %LOGIN /usr/lib/squid3/squid_ldap_group -R -K -b "dc=mydomain,dc=local" -D squid@mydomain.local -W /etc/squid3/ldappass.txt -f "(&(objectclass=person)(sAMAccountName=%v)(memberof=%g,DC=mydomain,DC=local))" -h ldap.mydomain.local

    ### squid defaults
    acl manager proto cache_object
    acl localhost src 127.0.0.1/32 ::1
    acl to_localhost dst 127.0.0.0/8 0.0.0.0/32 ::1
    acl SSL_ports port 443
    acl Safe_ports port 80 # http
    acl Safe_ports port 21 # ftp
    acl Safe_ports port 443 # https
    acl Safe_ports port 70 # gopher
    acl Safe_ports port 210 # wais
    acl Safe_ports port 1025-65535 # unregistered ports
    acl Safe_ports port 280 # http-mgmt
    acl Safe_ports port 488 # gss-http
    acl Safe_ports port 591 # filemaker
    acl Safe_ports port 777 # multiling http
    acl CONNECT method CONNECT
    http_access allow manager localhost
    http_access deny manager
    http_access deny !Safe_ports
    http_access deny CONNECT !SSL_ports
    http_access allow localhost

    ### acl for proxy auth and ldap authorizations
    acl SECURE_Users external memberof "/etc/squid3/SECURE_Users.txt"
    acl ntlm_users proxy_auth REQUIRED
    acl SECURE_Sites dstdomain "/etc/squid3/SECURE_Sites.txt"
    acl SECURE_VLAN src "/etc/squid3/SECURE_VLAN.txt"

The config causes Squid to authenticate user requests using NTLM or LDAP with our domain controller/LDAP. Then using ACL's it checks that the user is a member of the group(s) in the SECURE_Users.txt file and the URL is listed in SECURE_Sites.txt and they are coming from a network within the SECURE_VLAN.txt file.

### SECURE_Users.txt

    CN=Group_Name,OU=Users

### SECURE_Sites.txt

    .secure.uk

### SECURE_VLAN.txt

    192.168.0.0/24

Then all of the management is pretty much left to Active Directory. So you give users access just by making them a member of the group \[Group_Name\]. The actual config is a little more tricksy than that shown, but the general gist is here.
