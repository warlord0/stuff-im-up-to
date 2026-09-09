---
pubDatetime: 2021-11-03T13:42:36Z
title: "Project Gatekeeper, Part 4"
tags:
  - "ldap"
  - "Linux"
description: "This section focusses on the optional configuration of a custom schema for LDAP. It's completely optional, as you can use ready-made LDAP attributes to sto"
---
This section focusses on the optional configuration of a custom schema for LDAP. It's completely optional, as you can use ready-made LDAP attributes to store data.

> **Why would we do this?**
>
> LDAP already has a number of attributes you can use to store card and pin details, but I'd rather have a set of specific, well named attributes that are clearly designed for the purpose. For instance, I could store a Card UID in `employeeNumber`, but why not have an attribute `CardUID` instead?

## The Custom Schema

I want to store 3 attributes for the gatekeeper to read - a card uid, a pin and a schedule. The card uid is a simple numeric string, the pin is a number and the schedule will be a json structure containing days and times access is accepted.

It took me quite a while to figure out how to build the schema. I needed an OID for the schema and each attribute. I also needed to know how to specify what data type the attributes are.

An [OID](https://ldapwiki.com/wiki/How%20To%20Get%20Your%20Own%20OID) is a unique identify that prevents other organisation from trampling over other's structural design. It means that I know that my LDAP schema is unique to our organisation and won't cause any issue if another organisation chooses to use our schema in their LDAP server.

The unique part of the OID 1.3.6.1.4.1.29192 designates our organisation. What follows that are free for me to specify.

You can get your own OID using guidance here: [How to get your own OID](https://ldapwiki.com/wiki/How%20To%20Get%20Your%20Own%20OID) or even easier by going here [ViaThinkSoft](https://oidplus.viathinksoft.com/oidplus/?goto=oidplus%3Acom.viathinksoft.freeoid)

With my OID solved, I can now move on to find out how to specify what my data types are. If you search for this stuff it can be hard to figure out. Eventually I came across this: [Attribute Syntaxes](https://ldap.com/attribute-syntaxes/) which I used to specify the types.

|                 |                               |
|-----------------|-------------------------------|
| DirectoryString | 1.3.6.1.4.1.1466.115.121.1.15 |
| Integer         | 1.3.6.1.4.1.1466.115.121.1.27 |

### accessperson.schema

```
dn: cn=accessperson,cn=schema,cn=config
objectClass: olcSchemaConfig
cn: accessperson
olcAttributeTypes: {0}( 1.3.6.1.4.1.29192.200.100.1 
    NAME 'accessCardUID' 
    EQUALITY caseExactMatch 
    SYNTAX 1.3.6.1.4.1.1466.115.121.1.15 SINGLE-VALUE )
olcAttributeTypes: {1}( 1.3.6.1.4.1.29192.200.100.2 
    NAME 'accessPIN' 
    EQUALITY integerMatch
    SYNTAX 1.3.6.1.4.1.1466.115.121.1.27{1024} SINGLE-VALUE )
olcAttributeTypes: {2}( 1.3.6.1.4.1.29192.200.100.3 
    NAME 'accessSchedule' 
    EQUALITY caseIgnoreMatch 
    SUBSTR caseIgnoreSubstringsMatch 
    SYNTAX 1.3.6.1.4.1.1466.115.121.1.15{64512} SINGLE-VALUE )
olcObjectClasses: {0}( 1.3.6.1.4.1.29192.200.100 
    NAME 'accessperson' 
    DESC 'accessPerson' SUP top STRUCTURAL 
    MUST cn 
    MAY ( accessCardUid $ accessPin $ accessSchedule ) )
```

Once you take out the confusing OID numbers, the schema is more easily understood.

I will be adding a new `dn` `access-people` into the schema at `cn=schema,cn=config` where all the schemas live.

It has a class of `olcSchemaConfig`, because it is a schema.

It's common name `cn` is `accessperson`

Next, I start listing attributes I want added to the schema. The order isn't important other than the `olcAttributeTypes` must exist before the `olcOjectClasses` is created - simply because it references all the `olcAttributeTypes`.

The `olcAttributeTypes` are indexed by the `{#}` and are given a unique OID prefixed with our organisations OID. I chose to use `200.100.#` where I increment `#` to give each one uniqueness.

The `NAME` is how it will appear in my LDAP browser.

`EQUALITY` denotes how searches will handle the query. Without an equality it cannot be searched for.

`SUBSTR` allows a query to match part of the value in a search.

The `SYNTAX` as detailed above specifies the type and the length of the data to be stored.

Finally, we build the attributes into a class using `olcObjectClasses`. This again is indexed and has a unique OID. Notice how I've used this as the prefix for the attributes. This way I can see they are linked.

*This schema will allow you to then add the attributes to any user, eg. `accessCardUID`, `accessPIN` and `accessSchedule`.*

Import the schema in OpenLDAP using

```
ldapadd -H ldapi:// -Y EXTERNAL -D cn=config -f accessperson.schema
```

**WARNING:** Make sure you have a backup first.

## Adding Attributes to People

To add the attributes you first need to add the `objectClass` `extensibleObject` to the person. Then you can add the access attributes without error.

*The accessPin attribute is numeric only*
