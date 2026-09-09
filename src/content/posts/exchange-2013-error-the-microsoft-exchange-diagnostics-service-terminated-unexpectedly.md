---
pubDatetime: 2017-01-24T14:26:48Z
title: "Exchange 2013 Error: \"The Microsoft Exchange Diagnostics service terminated unexpectedly\""
tags:
  - "exchange"
  - "Windows"
description: "Had this showing up regularly in the event log of one of our Exchange servers. A quick delete of the following keys and a reboot all sorted: HKLM\\SOFTWARE\\"
---
Had this showing up regularly in the event log of one of our Exchange servers. A quick delete of the following keys and a reboot all sorted: `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache\Tree\Microsoft\Windows\PLA` `ExchangeDiagnosticsDailyPerformanceLog` and `ExchangeDiagnosticsPerformanceLog` References: [http://exchangeitup.blogspot.co.uk/2016/01/exchange-2013-error-microsoft-exchange.html](http://exchangeitup.blogspot.co.uk/2016/01/exchange-2013-error-microsoft-exchange.html)
