---
pubDatetime: 2017-05-11T12:44:51Z
modDatetime: 2021-07-25T15:36:26Z
title: "Setting up Baofeng UV-5R for PMR 446"
tags:
  - "Privateer"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Yes, it is illegal so don’t press the transmit button 1. Reset the radio to factory defaults Goto Menu 40 (Press Menu followed by 40 or use up down to scro"
---
> Yes, it is illegal so don’t press the transmit button

### 1. Reset the radio to factory defaults

Goto Menu 40 (Press Menu followed by 40 or use up down to scroll to RESET ALL)

Press Menu to move the select down to ALL, press Menu. Press Menu to confirm, then Menu again to reply to SOURCE? (Which I’m sure is a bad translation of SURE?)

### 2. Set the Language.

The Radio will restart and now speak in Chinese. Great if you speak Chinese.

Set it back to English by pressing Menu 14 to get to VOICE, press Menu to move the selector to CHI, press UP or DOWN to get to ENG, press Menu to confirm.

Turn off and on radio it should be in English now.

### 3. Set the Step to 6.25k

Goto Menu 1, press Menu to move the selector down. Press 2, and when it shows 6.25k press Menu to confirm.

### 4. Enter the first PMR 446 frequency

Press VOF/MR to until it says “Frequency Mode”

Type in 446006, it will show 446.006 you’ll see a tiny 25 to the right of it.

### 5. Save this as channel 1

Goto Menu 27, press Menu to move the selector down, press UP until you reach 001 – this is channel 1. Press Menu to store this current frequency as channel 1.

### 6. Setup the other 7 channels

This shouldn’t require any more typing of channel numbers.

Press VOF/MR until it says “frequency mode”. You should see your 466.00625 channel

Press UP twice and it should show 446.01875 this is channel 2.

Save it into channel 2 using the same process as step 5.

Exit the menu (Press Exit) and you’re back at your frequency 446.01875

Now it’s just a case of pressing UP twice to raise the frequency to the next channel and save each channel until you reach 8.

#### The full list of channels should look like:

1.  446.00625
2.  446.01875
3.  446.03125
4.  446.04375
5.  446.05625
6.  446.06875
7.  446.08125
8.  446.09375

### 7 . Deleting Channels

If you want to delete channels 0 and 127 just goto Menu 28, press Menu to drop the selector down, press UP or DOWN to choose the channel to delete and confirm by pressing Menu.

### 8. Show Channels instead of Frequencies

Just my preference, but in Channel Mode I want it to show the channel number not the 446 frequency.

Goto Menu 21 (MDF-A), press Menu to drop the selector, use UP or DOWN to scroll to CH. Do the same for Menu 22, and now you’ll see CH-001 etc. on the screen when in Channel Mode.
