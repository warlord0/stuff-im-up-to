---
pubDatetime: 2017-02-01T20:44:25Z
modDatetime: 2017-02-01T21:30:46Z
title: "Rant by a Complete Java Noob"
tags:
  - "java"
  - "Web"
heroImage: "/blog-media/2017/01/java-logo-png-e1485773197141.png"
description: "I confess, I'm a complete Java noob. In fact slightly worse than that, I'm a Java hater. In principle it's a great idea, cross platform and all that jazz,"
---
I confess, I'm a complete Java noob. In fact slightly worse than that, I'm a Java hater. In principle it's a great idea, cross platform and all that jazz, but in execution it leaves me frustrated. Seems most vendors I encounter may use Java, but use libraries specific to Windows making it as mobile as Jabba the Hutt. Also vendor installations that require Java seem to only be able to support last years version of Java, not the newest stable, and therefore it has so many vulnerabilities it makes it impossible to pass any kind of security audit. This month I've been trying to buckle down and get stuck in to understand things more. Try to figure out how all of this is strung together and see if anything can be done to satisfy the needs of the application and security.

### 32bit and 64bit

First gripe about Java is 32bit and 64bit. Which I guess is aimed more at Windows, another pet hate of mine. It seems we end up with software installed that requires both 32bit and 64bit versions of Java to be present on the system to function. Second. Some systems require not just the (JRE) runtime environment, they also require the development kit (JDK). The JDK comes with the JRE, ok. But then it seems it also comes with the JRE, wait, what? Yes, Under the JDK install path is JRE... but also installed into a separate folder is the JRE. eg. if you put the JDK into c:\Java\JDK you'll find c:\Java\KDK\jre contains the JRE. But then you'll also be given the opportunity to install the JRE during the Windows install process that will also put another copy of it by default under "C:\Program Files". I have no clue why.

### Upgrading

Now until recently we ended up with lots of Java versions installed at the same time. So we'd find Java 1.7 installed as well as 1.8. Oracle since did what I thought was sensible and detected the previous versions during the install process and asked it you wanted to remove them. I thought that would be that, but not quite. Because the new version is in a different folder your vendor installed programs that depend on Java will likely fail - that is if your vendors install things like I've been discovering. Rather than rely on the environment variable %JAVA_HOME% the vendor will probably have hard coded the path to Java in their config files somewhere. So now the old version has gone, your software no longer works. So now you've got to find that elusive config settings and hope the vendor is going to continue to offer support for their product now you've modified it - or installed an unsupported version of Java. Then as if dealing with updated versions wasn't bad enough, you add into that the fact that your vendor product requires both Java 32bit and 64bit.

> So that's why they hard coded the Java path in their config.

You can't use and environment variable when you need to run both 32bit and 64bit. So now I end up with four Java installations (I'm being generous, as it could be counted as six). JDK 32bit, JDK 64bit, JRE 32bit and JRE 64bit - all on one system. All with separate installers. So now you have to update all of these to ensure you're on a common version.

### Security

Now we've got all these Java's on the go, how do we deal with securing them? They don't rely on Windows for any encryption settings like CA Certificates and ciphers. Java has a folder under `%JAVA_HOME%\lib\security` that contains a keystore, called `cacerts`, for CA certificates and has a `java.security` file that configures the security features. All I want to do is install our Domains CA certificate so Java will trust certificates issued by our CA. Straight forward enough, but now I have to do this in how many locations? - at least four by the look of it.

> What happens to the important changes to these files when I install an updated version of Java?

### Integrating with Microsoft SQL Databases

This actually isn't as bad as I thought it would be. The MS SQL driver is a pretty straight forward download and it doesn't really install, just extracts to a path of your choice. It contains different files for JRE 7 and 8, and then within those DLL's for both 32bit and 64bit. So now all you have to do it put it somewhere your vendor application can use it. So just grab the `sqljdbc42.jar` (or `sqljdbc41.jar` for JRE 7) file and add it in to your Java library path right? Erm, yeah sure if you could use a `%CLASSPATH%`, but you can't because you need 32bit and 64bit support. So now you must copy it to someplace your vendor app knows about and modify the vendor config so when Java launches it can find the .jar file. Oh, wait. What about the DLL's? Well I guess that depends on the vendors need to use Windows authentication as to whether you need them or not. As for where to put them... I still have to figure that out, as by just using the .jar file SQL authentication worked just fine. Keep an eye out in the vendor config for anything that looks like:

    -classpath [/some/path]/sqljdbc42.jar

or just the abbreviated version `-cp`.

### Then Along Comes Tomcat

Yay! Everyone in the office makes an Officer Dibble reference when anything comes up about Tomcat. But now I've actually put some time in to figure this out a bit, it's probably the most straight forward bit I've come across. Tomcat is happy to use the `%JAVA_HOME%` variable and starts up and runs from a simple zip extract - although a Windows installer is available. Making it run as a service is simple too. Securing it and changing the config is also pretty straight forward once you read the apache.org guides - which it looks like our vendors never do. Once it's running, well, that's where I end my experience. Deploying a Java webapp to it, well that's for another day. All I want is to be able to upgrade it from a vulnerable version, to the latest stable version where the known vulnerabilities have been fixed. I thought that would be easy, as installing and running it seems pretty straight forward. But it seems updating Tomcat is a similar frustration as Java. You can install many different and separate versions. If you install a new one, then getting your webapps into the new one and ensuring the config transfers between the old and new looks like the kind of task you want to do because you feel guilty about something and deserve to be punished.

### There's Always One More Thing

Then the vendor uses a 3rd party product to support theirs and it needs to run as a service. Sounds easy right? Not. You now find out this is why you have a need for Java 32bit and 64bit. To run the 3rd party product as a service you need another product called `Java Service Wrapper`. This wrapper comes in community, standard and professional versions. But the "free" community edition is only available as 32bit, the 64bit is a chargeable product. So by using wrapper to run a Windows service I need Java 32bit, which runs the product as 32bit, whilst the core application runs from Tomcat as 64bit. Pretty much because the vendor of the core product wont pay for the 64bit wrapper product - and never told us it was an option so we could pay for it and simplify our install base.

> **Why is this so much more difficult than it should be?**
