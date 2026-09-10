---
pubDatetime: 2018-02-01T14:01:44Z
modDatetime: 2018-02-01T15:19:39Z
title: "XmlWriter and Encoding"
tags:
  - "powershell"
  - "Windows"
heroImage: "/blog-media/2018/02/powershell-logo-banner.png"
description: "This could have saved me some time today! http://hoolihan.net/blog-tim/2008/10/02/utf-8-encoding-with-xmlwriter-and-a-stringbuilder/ I'm new to PowerShell"
---
This could have saved me some time today! [http://hoolihan.net/blog-tim/2008/10/02/utf-8-encoding-with-xmlwriter-and-a-stringbuilder/](http://hoolihan.net/blog-tim/2008/10/02/utf-8-encoding-with-xmlwriter-and-a-stringbuilder/) I'm new to PowerShell and this was hard work to find that it's not my problem.

    $enc = [System.Text.Encoding]::GetEncoding(28591) # iso-8859-1

    # Using StringBuilder to form a valid XML file with encoding declaration
    $builder = New-Object System.Text.StringBuilder
    $stringWriter = New-Object System.IO.StringWriter($builder)

    $settings = New-Object System.XML.XmlWriterSettings
    $settings.Encoding = $enc
    $settings.Indent = $true
    $settings.CloseOutput = $false
    $settings.CheckCharacters = $true

    Write-Host $settings.Encoding

    $writer = [System.XML.XmlWriter]::Create($builder, $settings)

    Write-Host $writer.Settings.Encoding

    $xmlDoc.AppendChild($xmlData)

    $xmlDoc.Save($writer) # Save the XML into the $writer object
    $writer.Close()
    $stringWriter.Dispose()

I created a settings object to set the encoding I wanted and then passed that into `XmlWriter::Create` but it gets totally ignored and reverts back to default UnicodeEncoding.

### Output:

    System.Text.Latin1Encoding
    System.Text.UnicodeEncoding

So the settings value is `Latin1Encoding`, but once it reaches the other side of the `XmlWriter::Create` it has become `UnicodeEncoding`. The result is every XML file I create has `encoding="utf-16"` in the declaration.
