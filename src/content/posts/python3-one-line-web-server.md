---
pubDatetime: 2022-09-06T11:31:59Z
title: "Python3 One Line Web Server"
tags:
  - "Networking"
  - "python"
  - "Web"
description: "Many times I find myself wanting to spin up a simple test service for a firewall rule. You can bring up a simple web server in Python3 from the command lin"
---
Many times I find myself wanting to spin up a simple test service for a firewall rule. You can bring up a simple web server in Python3 from the command line.

```
python3 -m http.server
```

This will start it on port 8000 (`http://0.0.0.0:8000`). To start it on port 80 you will need root privileges, as per any port from 0-1023.

```
sudo python3 -m http.server 80
```
