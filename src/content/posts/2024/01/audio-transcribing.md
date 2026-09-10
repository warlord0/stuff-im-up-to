---
pubDatetime: 2024-01-30T21:16:03Z
modDatetime: 2024-01-30T21:21:21Z
title: "Audio Transcribing"
tags:
  - "Linux"
heroImage: "/blog-media/2024/01/transcription.png"
description: "I found myself in a position of recording an audio conference and then wanting to get a transcription of the discussion. On my Android phone, there seems to be a plethora of apps in the store you can use, but my content was an hour and a half long. The best I could get was 5 minutes of transcript for free, or buy minutes."
---
## AKA Spoken audio to text.

I found myself in a position of recording an audio conference and then wanting to get a transcription of the discussion. On my Android phone, there seems to be a plethora of apps in the store you can use, but my content was an hour and a half long. The best I could get was 5 minutes of transcript for free, or buy minutes.

After a bit of browsing, I found there were products available on Linux as Free and Open Source Software. But how do I use them? I found some quite complicated. All I wanted was here's the file, now give me text. Many required training and had command lines I could not be bothered to figure out.

I settled on `openai-whisper` from [https://github.com/openai/whisper](https://github.com/openai/whisper)

First, you need to resample your audio to mono and 16k. To do this I used `ffmpeg`, but understand I could have used `sox`. Then I take the mono output `.wav` file and run it through the `whisper.cpp-medium.en` program.

Install `ffmpeg` and `whisper` in Manjaro using

```
pamac install whisper.cpp-medium.en ffmeg
```

Convert the audio file to mono, 16k `.wav`, and run the `.wav` through `whisper`.

```
ffmpeg -i input_file.m4a -ar 16000 -ac 1 output_file.wav
whisper.cpp-medium.en output_file.wav --output-txt > transcript.txt
```

Now, this took a fair old time, probably as long as it takes to play the audio. Even on an Intel i9-9900k with 16-cores. But the output text file is super quality.
