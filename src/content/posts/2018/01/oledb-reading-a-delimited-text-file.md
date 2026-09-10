---
pubDatetime: 2018-01-31T13:54:04Z
title: "OLEDB Reading a : Delimited Text File"
tags:
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "Been a long while since I used VBScript - I guess I should get more familiar with PowerShell, but there's a simple project that requires a script change th"
---
Been a long while since I used VBScript - I guess I should get more familiar with PowerShell, but there's a simple project that requires a script change that reads a colon delimited file and converts it to comma separated. The original script read the file as a text file one line at a time and split the line into an array using the colon delimiter. Nothing too wrong with this, but the file is fixed length and loads of dead spaces to trim out, date conversions to be done and some special currency handling. So I thought I'd use an OLEDB method to read the data as a recordset. Should be simple enough right?

    Set cn = CreateObject("ADODB.Connection")
    Set rs = CreateObject("ADODB.RecordSet")

    cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=c:\temp;Extended Properties=""text;HDR=No;FMT=Delimited(:);"""

    rs.Open "select * from file.20180131;", cn, adOpenForwardOnly, adLockReadOnly, adCmdText

Well not really. The biggest problem I encountered was the file names in use are suffixed with the date eg. `filename.20180131`. That shouldn't be a problem, but the OLEDB text handler fails with anything but .txt, .asc, .csv extensions. Worse still the error messages it comes back with are terrible. First off I got messages about the file being read only, which it isn't.

> Microsoft Access Database Engine: Cannot update. Database or object is read-only.

Then adding in a `ReadOnly=False` to the connection string only made things worse!

> Microsoft Access Database Engine: Could not find installable ISAM.

All because the extension needs to be .txt! Then I finally get it working by using the .txt extension it reads the entire line into a single field/column. It ignores the `FMT=Delimiter(:)`in the connection string. This is because it doesn't work like that anymore. You MUST create a `schema.ini` file in the same location as your text file and configure the options that way.

    [file.txt]
    ColNameHeader=false
    CharacterSet=ANSI
    Format=Delimited(:)
    CurrencySymbol=#
    Col1=A Long
    Col2=B Long
    Col3=C Text
    Col4=D Currency
    Col5=E Date

Our file includes a \# instead of a GBP £ sign so we can even fix that in the `schema.ini` file by telling it to see the \# as a currency symbol. So we fix the VBScript and now we can read the data without messing with split(), arrays and data conversion.

    Set cn = CreateObject("ADODB.Connection")
    Set rs = CreateObject("ADODB.RecordSet")

    cn.Open "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=c:\temp;Extended Properties=""text;"""

    rs.Open "select * from file.txt;", cn, adOpenForwardOnly, adLockReadOnly, adCmdText

## OLEDB Drivers without installing Office

You don't need office on your server to read data using OLEDB. You can just install the [Microsoft Access Database Engine 2016 Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=54920)

### References

[https://docs.microsoft.com/en-us/sql/odbc/microsoft/schema-ini-file-text-file-driver](https://docs.microsoft.com/en-us/sql/odbc/microsoft/schema-ini-file-text-file-driver)
