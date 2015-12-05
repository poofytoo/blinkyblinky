# blinkyblinky
one fish, two fish, blink, blink, blink.

----
## All On

Turns all lights in Kresge the same color.

![All On](/samples/allon.gif?raw=true "All On")


----
## Propagate

Starting in the front row, propagates a *team color* backwards. Propagation rate increases as more rows get filled.

![Propagate](/samples/propagate.gif?raw=true "Propagate")


----
## Wave / Rainbow

**Wave** and **Rainbow** are two similar effects.

![Wave](/samples/wave.gif?raw=true "Wave")

Control the *color-change frequency* of **wave** using [W / S] keys.

![Rainbow](/samples/rainbow.gif?raw=true "Rainbow")


----
## Twinkle

**Twinkle** causes all lights in the auditorum to flicker a random color with modular brightness and frequency.

![Twinkle](/samples/twinkler.gif?raw=true "Twinkle")

- Control the *brightness* with [W / S] keys

- Control the *frequency* with [A / D] keys


----
## Paparazzi / Flicker

- **Paparazzi** causes all lights in the auditorium to flicker *white*, with a given probability. 

![Paparazzi](/samples/paparazzi.gif?raw=true "Paparazzi")

Control the probability with [W / S] keys.


- **Flicker** causes all lights in the auditorium to flicker with a given *team color*.

![Flicker](/samples/flicker.gif?raw=true "Flicker")

Control the probability with [W / S] keys.


---- 
## Fade Down

**Fade Down** charges all lights in the auditorium to maximum (white) brightness, and then gradually dims them to blackout over the course of ~2 secs.

![Flicker](/samples/flicker.gif?raw=true "Flicker")

---
## Hard-coded Constants

Here are the hard-coded constants that MAY need to be changed during the show, *depending on how well the wristbands are responding, and decreasing battery life*.
These can be changed at the top of the `/service/public/javascripts/main.js` file.

```javascript
const PROPOGATE_RATE = 300 // msec

const PAPARAZZI_RATE = 400 // msec
const PAPARAZZI_LED = ["64", "A0", "A0"] // [R, G, B] HEX

const RAINBOW_RATE = 900 // msec

const FADE_RATE = 150 // msec
const FADE_FACTOR = 0.83
const RED_ATTENUATION_FACTOR = 0.6

const waveIntervalMeter = [1000 / 10, 1000 / 8, 1000 / 6, 1000 / 5, 1000 / 4, 1000 / 3, 1000 / 2, 1000 / 1]
const twinkleIntervalMeter = [1000 / 7.5, 1000 / 5.0, 1000 / 4.0, 1000 / 3.0, 1000 / 2.0, 1000 / 1.5, 1000 / 1.0]
const brightnessMeter = [2, 5, 10, 20, 40, 80, 160, 255]
const probMeter = [20, 30, 45, 60, 80, 100, 125, 150, 180, 215, 255]
```

--- 
## Changing color-mixture values.
To adapt to changing battery life, you can change the color mixes for each *team color* in the side menu to the right (**R, G, B VALUES ARE IN HEX**). 

![Color Change](/samples/colorchange.gif?raw=true "Color Change")

Changes will be updated to the wristbands in **real-time**.
