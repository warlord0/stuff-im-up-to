---
pubDatetime: 2021-10-17T16:04:44Z
modDatetime: 2021-10-18T07:56:00Z
title: "Tasmota for esp8266/esp32"
tags:
  - "automation"
  - "electronics"
  - "esp32"
  - "esp8266"
  - "Linux"
  - "Privateer"
heroImage: "/blog-media/2021/10/espressif.png"
description: "Wow, what an incredible find this was! I'd been writing Arduino code for the esp8226/32 to match an electronics exercise I have been set. I was grabbing li"
---
Wow, what an incredible find this was!

I'd been writing Arduino code for the esp8226/32 to match an electronics exercise I have been set. I was grabbing libraries and all sorts to drive the project. Then I found [Tasmota](https://tasmota.github.io/docs/).

Tasmota is a prebuilt binary for esp8266/32 devices. It comes with all the stuff to make it talk to other automation devices. This means all the effort I spent investigating MQTT and handling interrupts and GPIO data handling has already been done for me. I can just flash my esp8266 with a Tasmota binary. Once flashed, it'll boot up and present itself as an access point you can connect to with your phone and visit [http://192.168.4.1](#) and begin configuring what your esp does from a WebUI.

It can get more complicated than that if you want some additional features, but even then you just build your own binary with docker and deliver it to the esp, and you're good to go.

For example, I'm going to use it for sensors, but also want to use Wiegand. To do this, I just edit the `user_config_override.h` file and add in the bits I want, eg.

```
#define USE_WIEGAND
```

Then build it.

Download the build tools - `docker-tasmota` image then download the Tasmota source into the build tool.

```
git clone https://github.com/tasmota/docker-tasmota
cd docker-tasmota
docker build -t docker-tasmota:latest .
git clone https://github.com/arendst/Tasmota.git
cd ..
docker run -ti --rm -v $(pwd)/Tasmota:/tasmota -u $UID:$GID docker-tasmota -e tasmota-sensors
```

This will then build you a binary containing plenty of sensor libraries to use.

Install the esptool to flash the esp with and flash the new binary to the chip.

```
pip install esptool
esptool.py --port /dev/ttyUSB0 write_flash -fs 4MB -fm dout 0x0 Tasmota/build_output/firmware/tasmota-sensors.bin
```

Reboot the esp and connect to it on your phone and goto [http://192.168.4.1](#)

## Other Options

After finding Tasmota I came across a few others that are simple to set up too. They don't seem as sophisticated or flexible as Tasmota, but they will get you up and running quickly.

- [ESPurna](https://bitbucket.org/xoseperez/espurna-original/wiki/Home)
- [ESP-Home](https://esphome.io/index.html)
- [ESP-Easy](https://espeasy.readthedocs.io/en/latest/index.html)
