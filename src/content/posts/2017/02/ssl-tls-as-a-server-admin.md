---
pubDatetime: 2017-02-28T15:22:46Z
modDatetime: 2017-03-01T09:37:53Z
title: "SSL/TLS as a Server Admin"
tags:
  - "certificates"
  - "Linux"
  - "Security"
  - "ssl"
  - "Windows"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "I don't trust you just because we can encrypt data together. I need to trust you based on a 3rd party we both trust telling me that you are who you say you are."
---
I'm not an encryption expert by any means. I've no great understanding of the mathematics involved in the encryption process and the ciphers used. What I do understand is what that means from the point of view of a server admin. One thing to state right now is that SSL/TLS are the same thing. SSL was simply renamed TLS, but the underlying principles are the same, the mechanisms and ciphers change, but the concept is the same - and despite the change it's still mostly referred to as SSL. The basic process of SSL is that in order to engage in a secure conversation between systems both systems must share a level of trust with a common 3rd party.

> I don't trust you just because we can encrypt data together. I need to trust you based on a 3rd party we both trust telling me that you are who you say you are.

In the world of clients and servers when you install Windows, Linux, Java etc. You will already be installing a list of known and trusted 3rd parties and the certificates they identify themselves with. So when I go buy a certificate from, let's say, GlobalSign I must identify myself to them so they give me a signed certificate saying this is who I am. They also sign it as evidence that they know who I am. When I present myself to other parties I can show them my certificate that is signed by GlobalSign and they can then check with the signing certificate they have been supplied with Windows etc. that the signature is legitimate and that means my certificate must be too. Ok, this is in very simple terms. But now you share your trust with me I can be sure that what I say is for your ears only and vice versa. How we actually speak to each other is up to us. We can choose the language we converse in and SSL helps us to do that. We need to know what common languages we must share to converse This is where we must decide on what version of SSL/TLS we use in common and what ciphers we use to encrypt our conversation. If we can't come to a mutually agreeable language then we cannot talk. By way of example if as a client I can only talk TLS1.0 the server I want to talk with must support TLS1.0. Both client and server may support multiple versions TLS1.0, TLS1.1, TLS1.2 and as long as the client has one in common they can take the next step. Now we share a common SSL version, do we share the ability to use a common cipher? The list of ciphers available vary between SSL versions, but also some ciphers are stronger than others. In many cases server admins must disable weaker ciphers that have already been compromised, so the client must meet the server with a shared cipher. If we can't agree on a common cipher then again, we can't talk. So as a simple analogy this is how we can encrypt our conversation:

- **Client**: Hello, I can speak English
- **Server**: Hello, I too speak English and here's my Passport to show you who I am.
- **Client**: That looks like you and I can see it was issued by the passport office.
- **Client**: Do you speak Spanish, Italian or French
- **Server**: I speak Italian, so let's do that in future.
- **Client**: Che tempo fa dove sei?
- ...

As a more specific look at the client/server process it becomes:

- **Client**: Hello I support TLS1.1 and the cipher TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA
- **Server**: Here's my certificate
- **Client**: (Checks the certificate was signed by a signing certificate I trust)
- **Client**: Everything I now tell you will be encrypted
- **Server**: Everything I now tell you will be encrypted
- **Client**: d04b98f48e8f8bcc15c6ae5ac050801cd6dcfd428fb5f9e65c4e16e7807340fa
- ...

![ssl_handshake](/blog-media/2017/02/ssl_handshake.png) If at any point of the conversation the other party isn't able to use the same version of SSL or algorithm or doesn't trust the certificate, then the conversation ends.

## Algorithms, ciphers and key exchanges

Don't let this bamboozle you. A cipher, or more correctly a cipher suite, is best thought of as a combination of algorithms, making up a key exchange type, an encryption algorithm and data verification mechanism. I find the terms algorithm and cipher often gets used interchangeably, so it's easier to think they mean the same thing. When you see a cipher suite described something like TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA what that actually means is it's a TLS cipher made up of the key exchange algorithm ECDHE_RSA with an encryption algorithm of WITH_AES_256 and a data integrity hash algorithm that is SHA (SHA1). But as I said, as a Server Admin don't over stress about that construction, just focus on the overall TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA and making sure that both parties support this cipher suite. You'll get hung up on the specifics of the algorithms when really all you usually need to know is am I using AES256, am I using SHA1 (SHA) or SHA2 (SHA256) .  As vulnerabilities are discovered you'll find your vulnerability scans start saying to disable specific ciphers - usually worded as only a part of the cipher, what that means is all algorithms that use that cipher, hash or key exchange must be disabled. So when you read that MD5 and RC4 must be disabled the any algorithm with those terms in their name need to be disabled.

## On the Client

Your client systems will all have the list of trusted certificates that came with your operating system or product. So when you try connecting to a server, as long as the server gives you a certificate that is signed by someone you trust, they'll begin to communicate happily. Out of the box most products come with certificates from the likes of GlobalSign, Thawte, Verisign, Comodo, Go Daddy and many more. So if the server you are going to connect to has bought a certificate from them, you'll trust it without realising that's what's happening.

## On the Server

In real terms the version of SSL, the algoritms, ciphers, keys etc. are the relatively easy part! It's when you are managing them on the Operating System that things get very difficult. This is because they all do things so differently. In Windows you enable and disable versions of SSL by using registry keys. Similarly for enabling ciphers and keys. But in Linux and Java the SSL versions, algorithms etc. are mostly handled in the configuration files for each service that makes use of SSL, or within a common configuration file. It's important to understand this as in Windows all your SSL settings are common within the registry. A change there affects ALL Windows based encryption. So if you have multiple web servers and applications in Windows they'll be restricted to what the registry says. Well that is until you encounter Java. Java runs on Windows and Linux and has it's own rules. It's use of algorithms and ciphers are controlled from with the `%JAVA_HOME%/lib/security/` folder and related `java.security` file. Changes here will affect all Java programs. So disabling ciphers in here is system wide... until you find a Java program that is specifically configured by using it's own configuration file This is what makes Java difficult for Server Admin's to manage. It's controlled by Application Admin's at this level. So it may be only the Application Admin or Vendor who know where or what this file is. It's also important to realise that if you update Java it overwrites your `java.security` and `cacerts` file. This is why vendors tend to use their own.

## CA Certificates

Windows, Linux and Java all come with certificates from the likes of GlobalSign, Thawte, Verisign, Comodo, Go Daddy and many more. But they are all stored differently. Windows uses a keystore that is managed using the MMC application and by adding in the "Certificates" snap in for the "Computer" . You can then browse the folders that make up the store to view the "Trusted Root Certificates". This branch shows us all the signing certificates that we trust automatically. In Linux the signing certificates are usually found as a file stored as `/etc/ssl/certs/ca-certificates.crt` and you can view the file to see all the Base64 encoded certificates (not particularly useful). But you can open it in some Linux file browsers and see a meaningful list. With Java you'll find the CA certs in `%JAVA_HOME%/lib/security/cacerts`. This is a Java Key Store (JKS) format file and you must manage it with `%JAVA_HOME%/bin/keytool`. With Windows update and Linux updates certificates are usually added to the existing store and expired ones removed whilst leaving everything else alone. With Java they are not! Java updates replace the entire `cacerts` file with a new one. So you should be aware that after an update you may have to re-import you own CA's using `keytool`. Or rely upon the Java application using it's own CA key store.

## Your Server Certificate

### A Public Facing Server

When you want a client system to connect and trust you automatically you have to buy a certificate from one of the widely known sources. If you buy a certificate or create one using an unknown signer, then the client would have to install that signers certificate before they trust you. That's a headache you don't need. How do you tell a client to install a certificate? Just buy one from a known vendor (Comodo are very cheap).

### But what if your server is for internal use only?

As a Server Admin you'll want your own signing authority. In the world of Windows this is pretty easy to setup. The added benefit being that when you add a machine to your domain you can have Group Policy put your signing certificate into the clients key store automatically so all your systems now trust each other.

### Obtaining a Signed Certificate

When you need a certificate there is a process to follow whether your using Windows, Linux or Java. First you must generate a public and private key pair. Their are two keys One you keep that unlocks your messages, one you give to others so they can lock messages to send to you.We generate a private key and then send a request containing our public key to a signing authority telling them who we are. The signing authority then signs our public key and returns to us a certificate that contains our public key and a signature that verifies who we are. When we install that certificate we can then start talking to clients and let them know and trust our public key.

1.  Generate a Key and store it in our key store
2.  Create a Certificate Signing Request (CSR) and send the file to be signed
3.  Install the returned Signed Certificate to our key store
4.  Configure our applications to use the certificate from the key store

## Certificate Formats

When you create a key or obtain a certificate these can be stored in a number of different file types depending upon what Operating System you have. They can be converted between systems using `openssl`, but if you can get on in the right format it can save you some headaches. Certificates that you obtain back from a signing authority are often in a Base64 encoded .pem format. They'll usually have a .pem, .cer or .crt extension. You can spot them by opening them up in a text editor and you'll see the first line is readable text like:

    -----BEGIN CERTIFICATE-----

So if you have a fussy program that requires a specific extension it's often fine to just rename .pem to .crt, or .cer to suit what you need to import it into. Sometimes you'll encounter a .p7b file. This is specific to Windows, but often is Base64 encoded so you can open it in a text editor and see if it has the same  first line. Usually a .p7b file actually contains a number of certificates. It will have your public certificate and the signing certificate. Which is useful if your clients don't automatically trust the signer. Then you may find a Base64 file with the above extension that contains a line like:

    -----BEGIN RSA PRIVATE KEY-----

This is actually your private key and should not be given to anyone. It should only be used on the server system it is intended for. It should also be protected by a password. If anyone gets hold of your private key they can use it to decrypt or hijack all of your conversations! Some other file types used are not so interchangeable. A .pfx file is specific to Windows. It usually contains a private key and certificate, it usually has a password and is NOT a text file. It can only be imported into a key store. It's not often a file with a .pkcs12 extension is found, but the .pfx is a pkcs12 format file. It can be converted to other formats using `openssl.` By far the most mobile are Base64 encoded .pem format files. They work with Windows, Linux and Java. There are other articles on here specifically detailing how to import keys into key stores and how to use them. Hopefully this gave you a higher level view of how SSL/TLS is used on your servers. References: [https://en.wikipedia.org/wiki/Transport_Layer_Security](https://en.wikipedia.org/wiki/Transport_Layer_Security)
