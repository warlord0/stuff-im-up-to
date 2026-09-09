---
pubDatetime: 2017-01-25T15:24:19Z
modDatetime: 2017-01-25T15:25:15Z
title: "Disconnected RDP Sessions"
tags:
  - "Security"
  - "Windows"
description: "Who has left their account logged onto a server using RDP and has diconnected it leaving it open to session hijacking?"
---
Who has left their account logged onto a server using RDP and has diconnected it leaving it open to session hijacking? PowerShell Script rdp_who.ps1

    # Import the Active Directory module for the Get-ADComputer CmdLet
    Import-Module ActiveDirectory

    # Get today’s date for the report
    $today = Get-Date

    # Setup email parameters
    $subject = "ACTIVE SERVER SESSIONS REPORT - " + $today
    $priority = "Normal"
    $smtpServer = "smtp.domain.local"
    $emailFrom = "rdp@domain.local"
    $emailTo = "it.manager@domain.local"

    # Create a fresh variable to collect the results. You can use this to output as desired
    $SessionList = "ACTIVE SERVER SESSIONS REPORT - " + $today + "\n\n"

    # Query Active Directory for computers running a Server operating system
    $Servers = Get-ADComputer -Filter {OperatingSystem -like "*server*"}

    # Loop through the list to query each server for login sessions
    ForEach ($Server in $Servers) {
    $ServerName = $Server.Name

    # When running interactively, uncomment the Write-Host line below to show which server is being queried
    Write-Host "Querying $ServerName"
    # Run the qwinsta.exe and parse the output
    $queryResults = (qwinsta /server:$ServerName | foreach { (($_.trim() -replace "\s+",","))} | ConvertFrom-Csv)

    # Pull the session information from each instance
    ForEach ($queryResult in $queryResults) {
    $RDPUser = $queryResult.USERNAME
    $sessionType = $queryResult.SESSIONNAME

    # We only want to display where a "person" is logged in. Otherwise unused sessions show up as USERNAME as a number
    If (($RDPUser -match "[a-z]") -and ($RDPUser -ne $NULL)) {
    # When running interactively, uncomment the Write-Host line below to show the output to screen
    Write-Host $ServerName logged in by $RDPUser on $sessionType
    $SessionList = $SessionList + "\n\n" + $ServerName + " logged in by " + $RDPUser + " on " + $sessionType }
    }
    }

    # Send the report email
    Send-MailMessage -To $emailTo -Subject $subject -Body $SessionList -SmtpServer $smtpServer -From $emailFrom -Priority $priority

    # When running interactively, uncomment the Write-Host line below to see the full list on screen
    $SessionList

References: [http://discoposse.com/2012/10/20/finding-rdp-sessions-on-servers-using-powershell/](http://discoposse.com/2012/10/20/finding-rdp-sessions-on-servers-using-powershell/)
