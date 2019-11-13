# Inner Joysticks

After Effects panel to convert all [Joysticks N' Sliders](https://aescripts.com/joysticks-n-sliders/) controllers to HTML equivalents within a panel:

![](https://thumbs.gfycat.com/IdealImaginativeAcaciarat-size_restricted.gif)

I love JnS and use it all the time for pose-based rigging, but I find myself doing things every time I create a Joystick:

- Since I often animate on white, I always need to add a fill to the Joystick and delete the stroke.
- I dislike how large Joysticks come by default (they normally fill my entire comp), I have to scale them down every time
- I always fight for comp space between my controllers and rigs

In preparation for Quasarcade and creating HTML joysticks to use for Lottie rigs, I experimented with substituting AE Joysticks all together. For the most part it works, but there's a noticeable lag in complex art from the polling rate in which the panel sends scripting commands.

## Installation

Use the zxp located in `./archive` with any valid ZXP installer

## Features

- Supports an infinite amount of Joysticks (but only within the current comp)
- Gamepad alt-skin allows you to easily place exact corner and key values of Joysticks
- Joystick size and layout fully responsive
- Joystick size can be locked
- Can auto-hide any Joysticks within comp during scan

## Todo

- Finish settings modal -- maybe allow color coding of Joysticks and alternate CSS Grid layout
- Add interactive user on-boarding tutorials
- Finish Sliders (but is this necessary? Sliders are convenient enough in the Effect Controls)
