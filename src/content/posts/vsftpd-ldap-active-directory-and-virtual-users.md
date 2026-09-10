---
pubDatetime: 2015-08-04T07:41:43Z
modDatetime: 2016-09-21T20:12:09Z
title: "VSFTPD, LDAP (Active Directory) and Virtual Users"
tags:
  - "active directory"
  - "ftp"
  - "ldap"
  - "Linux"
  - "pam"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "PAM and LDAP Getting this going is a challenge. It needs some tweaks with PAM to get the authentication going. In order to get it to work we needed libpam-"
---
## PAM and LDAP

Getting this going is a challenge. It needs some tweaks with PAM to get the authentication going. In order to get it to work we needed **libpam-ldapd** NOT to be confused with *libpam-ldap*. libpam-ldapd brings with is changes to nsswitch.conf so that certain pam capable services are capable of using ldap. The ones we need are passwd, group and shadow

### /etc/nsswitch.conf

    # /etc/nsswitch.conf
    #
    # Example configuration of GNU Name Service Switch functionality.
    # If you have the `glibc-doc-reference' and `info' packages installed, try:
    # `info libc "Name Service Switch"' for information about this file.

    passwd:         compat ldap
    group:          compat ldap
    shadow:         compat ldap

    hosts:          files dns ldap
    networks:       files

    protocols:      db files
    services:       db files
    ethers:         db files
    rpc:            db files

    netgroup:       nis
    aliases:        ldap

But the install using 'apt-get install libpam-ldapd' should ask you about all this as you install it. It'll also ask you for the ldap server uri you want to use for them (typically in the form ldap://ldap.default.com/). The install provides two services nscd and nslcd which are the name service cache daemon and ldap cache daemon. These are the crux of talking to the ldap server so need to be configured properly. But it does miss out some of the setting that you'll need to actually bind to the server (unless you're using anonymous binds). So to sort things out you'll need to make changes to nslcd.conf - along with quite a few other changes to get the mapping of Active Directory Attributes to Unix attributes. One of the steps taken here was to install the Unix Identification Services role onto the AD domain controller. In nslcd.conf the important changes are for binddn and bindpw as we don't allow anonymous binds. Then we have a lot of Active Directory specific changes to cater for the mapping of the uid to sAMAccountName etc. So far this is for a plain insecure ldap not ldaps/tls connection. Some of the filter parameters can be changed to suit.

### /etc/nslcd.conf

    # /etc/nslcd.conf
    # nslcd configuration file. See nslcd.conf(5)
    # for details.

    # The user and group nslcd should run as.
    uid nslcd
    gid nslcd

    # The location at which the LDAP server(s) should be reachable.
    uri ldap://192.168.0.5/

    # The search base that will be used for all queries.
    base ou=FTP Users,dc=mydomain,dc=local

    # Mappings for Active Directory
    pagesize 1000
    referrals off
    filter passwd (&(objectClass=user)(uidNumber=*)(unixHomeDirectory=*))
    map    passwd uid              sAMAccountName
    map    passwd homeDirectory    unixHomeDirectory
    #map    passwd homeDirectory    "/home/vftp/$sAMAccountName"
    map    passwd gecos            displayName
    map    passwd loginShell       "/bin/false"

    filter shadow (&(objectClass=user)(uidNumber=*)(unixHomeDirectory=*))
    map    shadow uid              sAMAccountName
    map    shadow shadowLastChange pwdLastSet

    filter group  (&(objectClass=group)(gidNumber=*))
    #map    group  uniqueMember     member

    # The LDAP protocol version to use.
    ldap_version 3

    # The DN to bind with for normal lookups.
    #binddn cn=annonymous,dc=example,dc=net
    #bindpw secret

    binddn CN=Proxy User,CN=Users,DC=mydomain,DC=local
    bindpw xxxx

    # The DN used for password modifications by root.
    #rootpwmoddn cn=admin,dc=example,dc=com


    # SSL options
    #ssl off
    #tls_reqcert never

    # The search scope.
    #scope sub

In order to match the AD user accounts the attributes for uidNumber, gid and unixHomeDirectory need to be completed. Any missing info will result in a failure to logon. Test nslcd by stopping the daemon and running it as a manual service so you can debug it. Give get ent a try to see if it returns any of the users from AD.

    # service nslcd stop
    # nslcd -d

    # getent passwd

## VSFTPD

The How-To notes for this are a little shaky and it takes some tweaking to get it right. The way we have it working is each ftp user gets created in AD (with the necessary Unix attributes). Then they can simply logon to the FTP service, their home directory will get created and they will be chroot'ed into it so all they can see are their own files. This is with the exception of the ftproot user (also an ldap/AD user) as this user get's chroot'ed into the /home/vftp location and therefore can see all the folders for the other ftp users. One caveat with all this is that the version of vsftpd required must support the option for 'allow_writeable_chroot=YES' so you have to download it from an alternative apt source if you're using version 2.3.5.

### /etc/vsftpd.conf

    # Run standalone?  vsftpd can run either from an inetd or as a standalone
    # daemon started from an initscript.
    listen=YES

    # Uncomment this to enable any form of FTP write command.
    write_enable=YES 

    # Activate directory messages - messages given to remote users when they
    # go into a certain directory.
    dirmessage_enable=YES

    # If enabled, vsftpd will display directory listings with the time
    # in  your  local  time  zone.  The default is to display GMT. The
    # times returned by the MDTM FTP command are also affected by this
    # option.
    use_localtime=YES

    # Activate logging of uploads/downloads.
    xferlog_enable=YES

    # Make sure PORT transfer connections originate from port 20 (ftp-data).
    connect_from_port_20=YES

    # It is recommended that you define on your system a unique user which the
    # ftp server can use as a totally isolated and unprivileged user.
    nopriv_user=ftp

    # You may restrict local users to their home directories.  See the FAQ for
    # the possible risks in this before using chroot_local_user or
    # chroot_list_enable below.
    chroot_local_user=YES
    chroot_list_enable=YES

    # This option should be the name of a directory which is empty.  Also, the
    # directory should not be writable by the ftp user. This directory is used
    # as a secure chroot() jail at times vsftpd does not require filesystem
    # access.
    secure_chroot_dir=/var/run/vsftpd/empty

    # This string is the name of the PAM service vsftpd will use.
    pam_service_name=vsftpd

    # This option specifies the location of the RSA certificate to use for SSL
    # encrypted connections.
    #rsa_cert_file=/etc/ssl/private/vsftpd.pem
    rsa_private_key_file=/etc/ssl/private/wildcard.key
    rsa_cert_file=/etc/ssl/certs/wildcard.crt
    ssl_enable=YES
    allow_anon_ssl=NO
    force_local_data_ssl=YES
    force_local_logins_ssl=YES
    ssl_tlsv1=YES
    ssl_sslv2=NO
    ssl_sslv3=NO
    ssl_ciphers=HIGH

    debug_ssl=YES
    # Useful to not write over hidden files:
    force_dot_files=NO

    # Hide the info about the owner (user and group) of the files.
    hide_ids=YES

    # Connection limit for each IP:
    max_per_ip=2

    # Maximum number of clients:
    max_clients=20

    # Virtual users will use the same privileges as local users.
    # It will grant write access to virtual users. Virtual users will use the
    # same privileges as anonymous users, which tends to be more restrictive
    # (especially in terms of write access).
    virtual_use_local_privs=YES
    write_enable=YES
    anonymous_enable=NO
    local_enable=YES

    # Set the name of the PAM service vsftpd will use
    pam_service_name=vsftpd.ldap

    # Activates virtual users
    guest_enable=YES

    # Automatically generate a home directory for each virtual user, based on a template.
    # For example, if the home directory of the real user specified via guest_username is
    # /home/virtual/$USER, and user_sub_token is set to $USER, then when virtual user vivek
    # logs in, he will end up (usually chroot()'ed) in the directory /home/virtual/vivek.
    # This option also takes affect if local_root contains user_sub_token.
    user_sub_token=$USER

    # Usually this is mapped to Apache virtual hosting docroot, so that
    # Users can upload files
    local_root=/home/vftp/$USER
    allow_writeable_chroot=YES

    # Chroot user and lock down to their home dirs
    chroot_local_user=YES

    # Hide ids from user
    hide_ids=YES 

    # Logging 
    log_ftp_protocol=YES
    dual_log_enable=YES

    max_per_ip=5
    max_login_fails=3
    delay_failed_login=3
    ftpd_banner=Authorised Users Only 

    # PASV Port settings 
    pasv_min_port=9900
    pasv_max_port=9950 

    # Needed to allow LDAP auth logon
    session_support=YES 

    # Used to give the user ftproot a different chroot 
    user_config_dir=/etc/vsftpd

The only thing in the user specific user_config_file for ftproot (/etc/vsftpd/ftproot) is

    local_root=/home/vftp

### /etc/pam.d/vsftpd.ldap

    #%PAM-1.0
    auth required pam_ldap.so
    account required pam_ldap.so
    session required pam_ldap.so
    password required pam_ldap.so
    session required        pam_mkhomedir.so        skel=/etc/skel umask=0002

This does to authentication AND creates the users home directory using /etc/skel as a template and allowing the user and the ftp group access to it (umask 0002) which is required for the ftproot account to access the users folders.

## Using LDAPS

This was pretty straightforward. A few changes in the nslcd.conf file (as below) were needed. Also imported the ca certificate into the /etc/ssl/certs/ca-certificates.crt file and put the ldap server certificates and linked there hashes as below in [SSL CA Certificates](https://warlord0blog.wordpress.com/2015/07/21/ssl-ca-certificates/)

### /etc/nslcd.conf

    # SSL options
    ssl on
    #tls_reqcert never

    tls_cacertdir /etc/ssl/certs
    tls_cacertfile /etc/ssl/certs/ca-certificates.crt

    # The search scope.
    #scope sub
