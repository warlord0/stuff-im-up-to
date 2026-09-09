---
pubDatetime: 2022-04-30T19:22:58Z
title: "Consul Service Discovery & Nginx"
tags:
  - "Networking"
  - "nginx"
  - "Web"
description: "Building a resilient set of web services (or microservices) means setting up a proxy that is able to dynamically set up \"upstream\" services when they are a"
---
Building a resilient set of web services (or microservices) means setting up a proxy that is able to dynamically set up "upstream" services when they are available and remove them when they are not. For this, I took a look at [Hashicorp Consul](https://www.hashicorp.com/products/consul) - it does a lot more than I'm doing here, but I'm starting small.

This example has a pair of servers providing web services and in front of that we are using Nginx as the reverse proxy. The usual setup for load balancing on Nginx is to add the servers into the upstream configs and call them using a `proxy_pass` in the server section.:

```
upstream S00123-keycloak {
  zone upstream-S00123-keycloak 64k;
  server 192.168.122.171:8080 max_fails=3 fail_timeout=60 weight=1;
  server 192.168.122.62:8080 max_fails=3 fail_timeout=60 weight=1;
} 

server {
  listen 80 default_server;

  location /sso {
    proxy_pass http://S00123-keycloak;
  }
}
```

Simple enough? What happens when one of the servers goes down? It just uses the other available server.

We can add servers into our upstream as we create them, but Consul can intelligently add servers using its service discovery and templating. For example, If I spin up a third server to spread the load, I have to edit the Nginx config. Consul can do this for me. This enables me to spin up as many servers as I like, take others offline, and they will automatically update the Nginx config.

Consul does this by running an agent on each system. The agent tells the Consul cluster that it has some services available, and you can build a template that delivers the Nginx config on the fly.

## Create a Consul Cluster

I built 3 x Linux Alpine VM's and installed consul on each, as `consul1`, `consul2` and `consul3`. It's as easy as copying the extracted zip file to your path and executing it, eg. unzip consul to `/usr/local/bin`.

For the sake of user separation, I created a consul user and group:

```
sudo addgroup consul
sudo adduser consul -g consul
```

Create the path and config file `/etc/consul.d/config.json`

```
{
    "bootstrap_expect": 3,
    "client_addr": "0.0.0.0",
    "data_dir": "/tmp/consul",
    "domain": "consul",
    "enable_script_checks": true,
    "dns_config": {
        "enable_truncate": true,
        "only_passing": true
    },
    "enable_syslog": true,
    "encrypt": "XxeqvyR/kHSkavZMR1hmHg==",
    "leave_on_terminate": true,
    "log_level": "INFO",
    "rejoin_after_leave": true,
    "server": true,
    "retry_join": [
    "consul1",
    "consul2",
    "consul3"
    ],
    "ui": true,
    "connect": {
        "enabled": true
   }
}
```

Then start it on each system using:

```
sudo -u consul consul agent -server -config-dir /etc/consul.d
```

## Create the Web Services

My dummy web service is just a python web server on port 8080 and any others I throw into this python script. Again, I ran a simple Alpine VM and installed consul and python for my test script.

```
from threading import Thread
from socketserver import ThreadingMixIn
from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler

PORTS = [8080]
 
class MyHttpRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.path = 'index.html'
        return SimpleHTTPRequestHandler.do_GET(self)
 
Handler = MyHttpRequestHandler

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

def serve_on_port(port):
    print("Http Server Serving at port", port)
    server = ThreadingHTTPServer(("", port), Handler)
    server.serve_forever()

for port in PORTS:
    Thread(target=serve_on_port, args=[port]).start()
```

This will server `index.html` on port 8080 for testing with.

The `config.json` on this is simpler than the cluster servers:

```
{
    "data_dir": "/tmp/consul",
    "enable_syslog": true,
    "encrypt": "XxeqvyR/kHSkavZMR1hmHg==",
    "enable_local_script_checks": true,
    "rejoin_after_leave": true,
    "retry_join": [
        "consul1",
        "consul2",
        "consul3"
    ],
    "connect": {
        "enabled": true
   }
}
```

Now we create a json file to register the services with the cluster.

### /etc/consul.d/webservices.json

```
{
  "services": [{
    "name": "S00123-keycloak",
    "port": 8080,
    "check": {
      "args": ["curl", "localhost:8080"],
      "interval": "10s"
    },
    "tags": [ "S00123" ]
  }
}
```

Then we run consul, but with a subtle difference, no `-server` option:

```
sudo -u consul consul agent -config-dir /etc/consul.d
```

## Nginx Server

For the Nginx server, we also need to install consul. We can use exactly the same `config.json` as we did for the web service above. We also need to install, `consul-template` which is also easy as that can just be extracted from a zip file too.

The nginx server will be doing very little with consul other than updating the Nginx config when the services change.

### Create a Template File

#### /usr/local/consul/templates/S00123.conf.ctmpl

```
{{range services}} {{$name := .Name}} {{$service := service .Name}}
{{range .Tags}}
{{if eq . "S00123"}}
upstream {{$name}} {
  zone upstream-{{$name}} 64k;
  {{range $service}}server {{.Address}}:{{.Port}} max_fails=3 fail_timeout=60 weight=1;
  {{else}}server 127.0.0.1:65535; # force a 502{{end}}
} {{end}}
{{end}}
{{end}}
server {
  listen 80 default_server;

  location /sso {
    proxy_pass http://S00123-keycloak;
  }
}
```

This will be used to write the file `/etc/nginx/conf.d/S00123.conf`

Run the template program like this:

```
sudo consul-template -template "/usr/local/consul/templates/S00123.conf.ctmpl:/etc/nginx/conf.d/S00123.conf:systemctl reload nginx"
```

The template will be used to write the config file and then reload nginx.
