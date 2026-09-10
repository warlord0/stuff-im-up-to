---
pubDatetime: 2024-04-26T18:53:12Z
modDatetime: 2024-04-27T08:17:07Z
title: "Prometheus, Alert Manager and Docker Swarm"
tags:
  - "alertmanager"
  - "Docker"
  - "Linux"
  - "prometheus"
  - "Virtualisation"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "This is not a complete plug and go HOW-TO for using Prometheus for scaling a Docker Swarm, but it does contain the building blocks for how to do it. Orches"
---
This is not a complete plug and go HOW-TO for using Prometheus for scaling a Docker Swarm, but it does contain the building blocks for how to do it.

## Orchestration

Orchestration is the ability to deploy and manage systems. If we want to manage Docker, we would typically require an orchestration tool such as Kubernetes or Hashicorp Nomad.

Kubernetes has a steep learning curve, and to automatically scale services with Nomad you need an enterprise licence.

## Monitoring

### Prometheus

Prometheus is a time series database that is able to pull key value pairs (metrics) from systems that export the data using a web service.

Some software does this as a feature, others require additional services. If you install the `prometheus-node-exporter` service on Linux, you can gather a whole raft of metrics by visiting

[`http://localhost:9100/metrics`](#)

You then point Prometheus at the URL, and it will periodically scrape the data from the URL and process it into its time series database.

Our usage example is to monitor Nginx for the number of active connections. If it goes above 100, then we use AlertManager to trigger a message.

We scrape metrics from the `nginx-node-exporter` - published on port 9113, which collects the metrics from the Nginx `stub_status`. This location is enabled by adding the following directive into the `default.conf`

```
    location = /stub_status {
        stub_status;
        access_log off;
    }
```

#### prometheus.yml

```
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  scrape_protocols:
  - OpenMetricsText1.0.0
  - OpenMetricsText0.0.1
  - PrometheusText0.0.4
  evaluation_interval: 1m

rule_files:
  - "rules.yml"

scrape_configs:
- job_name: nginx
  static_configs:
  - targets: ["192.168.121.174:9113"]

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['192.168.121.174:9093']
```

Under the `alerting:` stanza, we add in the target IP address and port (9093) for our AlertManager instance.

#### rules.yml

```
# rules.yml
groups:
  - name: nginx
    rules:
      - alert: Nginx 100 active connections
        for: 1m
        expr: nginx_connections_active{job="nginx"} >= 100
        labels:
          severity: critical
        annotations:
          title: Nginx 100 active connections on {{ $labels.instance }}
          description: The Nginx on instance {{ $labels.instance }} has seen >100 active connections for the past 1 minute.
```

### AlertManager

AlertManager is a Prometheus product that can be leveraged by Prometheus to send alerts when conditions are met for specified rules about the metrics it received.

The messages it sends out can be of many types SMTP, web chat, discord, etc. and web hooks.

If we use a web hook, we can configure AlertManager with a simple config:

#### alertmanager.yml

```
global:
  resolve_timeout: 5m
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'webhook'
receivers:
  - name: 'webhook'
    webhook_configs:
      - url: 'http://192.168.121.174:3000'
        send_resolved: true
```

The `receivers:` stanza contains the webhook URL for our custom web service that will handle the data that is passed to it.

## Python

Using python, we have a simple script that listed on port 3000 for our posted web data from the web hook call.

```
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['POST'])
def process_webhook():
    try:
        alert_data = request.json
        # Process the alert data here (e.g., extract labels, annotations, etc.)
        # Implement your scaling logic based on the alert information
        # ...

        print("What we do to process the data goes here")

        # Return a response (optional)
        return jsonify({'message': 'Webhook received successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
```

The data that comes in from the AlertManager webhook is JSON, and when formatted looks like this:

When **firing**

```
{
    "receiver": "webhook",
    "status": "firing",
    "alerts": [
        {
            "status": "firing",
            "labels": {
                "alertname": "Nginx 100 active connections",
                "instance": "192.168.121.174:9113",
                "job": "nginx",
                "severity": "critical"
            },
            "annotations": {
                "description": "The Nginx on instance 192.168.121.174:9113 has seen >100 active connections for the past 1 minute.",
                "title": "Nginx 100 active connections on 192.168.121.174:9113"
            },
            "startsAt": "2024-04-26T17:21:05.311Z",
            "endsAt": "0001-01-01T00:00:00Z",
            "generatorURL": "http: //prometheus:9090/graph?g0.expr=nginx_connections_active%7Bjob%3D%22nginx%22%7D+%3E%3D+100&g0.tab=1",
            "fingerprint": "f19572f660b24b61"
        }
    ],
    "groupLabels": {
        "alertname": "Nginx 100 active connections"
    },
    "commonLabels": {
        "alertname": "Nginx 100 active connections",
        "instance": "192.168.121.174:9113",
        "job": "nginx",
        "severity": "critical"
    },
    "commonAnnotations": {
        "description": "The Nginx on instance 192.168.121.174:9113 has seen >100 active connections for the past 1 minute.",
        "title": "Nginx 100 active connections on 192.168.121.174:9113"
    },
    "externalURL": "http://alertmanager:9093",
    "version": "4",
    "groupKey": "{}:{alertname=\"Nginx 100 active connections\"}",
    "truncatedAlerts": 0
}
```

When **resolved**

```
{
    "receiver": "webhook",
    "status": "resolved",
    "alerts": [
        {
            "status": "resolved",
            "labels": {
                "alertname": "Nginx 100 active connections",
                "instance": "192.168.121.174:9113",
                "job": "nginx",
                "severity": "critical"
            },
            "annotations": {
                "description": "The Nginx on instance 192.168.121.174:9113 has seen >100 active connections for the past 1 minute.",
                "title": "Nginx 100 active connections on 192.168.121.174:9113"
            },
            "startsAt": "2024-04-26T17:21:05.311Z",
            "endsAt": "2024-04-26T17:23:05.311Z",
            "generatorURL": "http://prometheus:9090/graph?g0.expr=nginx_connections_active%7Bjob%3D%22nginx%22%7D+%3E%3D+100&g0.tab=1",
            "fingerprint": "f19572f660b24b61"
        }
    ],
    "groupLabels": {
        "alertname": "Nginx 100 active connections"
    },
    "commonLabels": {
        "alertname": "Nginx 100 active connections",
        "instance": "192.168.121.174:9113",
        "job": "nginx",
        "severity": "critical"
    },
    "commonAnnotations": {
        "description": "The Nginx on instance 192.168.121.174:9113 has seen >100 active connections for the past 1 minute.",
        "title": "Nginx 100 active connections on 192.168.121.174:9113"
    },
    "externalURL": "http://alertmanager:9093",
    "version": "4",
    "groupKey": "{}:{alertname=\"Nginx 100 active connections\"}",
    "truncatedAlerts": 0
}
```

We can then develop our python script to respond to the data received.

### Docker

We can include a very simple method in our webhook service, the ability to manage a service in Docker.

```
import docker

client = docker.from_env()
service = client.services.get('helloworld')
desired_replicas = 3 # Set your desired replica count
service.scale(desired_replicas)
```
