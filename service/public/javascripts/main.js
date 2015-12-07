//***********************//
// CONSTANTS and METERS //
//*********************//
const PROPAGATE_RATE = 400
const PROPAGATE_PROB = 35

const PAPARAZZI_RATE = 600
const PAPARAZZI_LED = ["60", "FF", "FF"] // HEX

const RAINBOW_RATE = 1000

const FADE_RATE = 300
const FADE_FACTOR = 0.83
const RED_ATTENUATION_FACTOR = 0.45

const waveFrequencies = [5, 4, 3, 2.5, 2, 1.5, 1] // Hz
const waveIntervalMeter = waveFrequencies.map(function(Hz) {
    return 1000 / Hz;
})
const twinkleFrequencies = [3, 2.5, 2, 1.5, 1]
const twinkleIntervalMeter = twinkleFrequencies.map(function(Hz) {
    return 1000 / Hz;
})
const brightnessMeter = [2, 5, 10, 20, 40, 80, 160, 255]
const probMeter = [45, 60, 80, 100, 125, 150, 180, 215, 255]

const escapeVals = [43, 47, 53, 55]

//**********//
// HOTKEYS //
//********//
const coloredKeys = {
    "R": "red",
    "O": "orange",
    "Y": "yellow",
    "G": "green",
    "B": "blue",
    "P": "pink",
    "U": "purple",
    "V": "silver",
    "0": "white",
    "8": "pink",
    "7": "red",
    "6": "blue",
    "5": "purple",
    "4": "silver",
    "3": "yellow",
    "2": "orange",
    "1": "green"
}


var state = '';

var audWidth = 0
var audHeight = 0;
var setDateStart = new Date().getTime();
var animationRefreshRate = 150;

var baconOriginX = 0;
var baconOriginY = 0;
var baconTolerance = 30;
var baconRingDistance = 120;

var allowBeaconStart = false;
var timer;
var timeout;

//***************************//
//     SIMULATION UTILS     //
//*************************//

function setSeatColor($this, colorCSS) {
    $this.css('background-color', colorCSS)
}

var flash = setSeatColor

function setSeatColorBrightness($this, colorCSS, seatAlpha) {
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorCSS);
    rgb = {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16)
    }
    $this.css('background-color', "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + seatAlpha + ")")
}

function setRowColor(row_ind, colorLED, colorCSS, callback) {
    command = "37 37 1 " + colorLED.join(" ") + " " + row_ind.toString(16).toUpperCase() + " 2B"
    sendData = {
        s: command
    }
    $.get('/manualserial', sendData, function(data) {
        //console.log(data)
        rowId = getRowId(row_ind)
        for (i in seats_by_row[rowId]) {
            index = parseInt(i) + 1
            $this = $('#' + seats_by_row[rowId][i].id)
            $this.css('background-color', colorCSS)
        }
        if (callback) {
            callback();
        }
    })
}

function flickerRow(row_ind, colorLED, colorCSS) {
    clearInterval(timer);
    timer = setInterval(function() {
        setRowColor(row_ind, colorLED, colorCSS, function() {
            setTimeout(function() {
                setRowColor(row_ind, BLACKOUT_LED, "#333333")
            }, PAPARAZZI_RATE / 2)
        })
    }, PAPARAZZI_RATE)
}

var updateRate = 50;
var prevF11Color = '';
var lastInputPrompt = '';

$(document).on('keydown', 'body', function(e) {
    if (e.which == 32) {
        $('#F_11').addClass('view-larger')
        $('.bash').show();
        $('.bash').find('input').focus();
    }
});

//***********************//
//   WAVE and RAINBOW   //
//*********************//

var waveIntervalLevel = 2
var waveRate = waveIntervalMeter[waveIntervalLevel]

function startTheWave() {
    clearInterval(timer);
    var c = -1;
    var r = -1;
    var up = true
    var nextRow = function() {
        r = r + (up ? 1 : -1)
        if (r == rows.length - 1) {
            up = false
            c = (c + 4) % waveOrder.length
        }
        if (r == 0) {
            Blackout()
            up = true
        }
        row_ind = getRowIndex(rows[r]) || 0
        if (row_ind >= 1 && row_ind <= rows.length) {
            c = (c + (up ? 1 : -1) + waveOrder.length) % waveOrder.length
            color = waveOrder[c]
            colorLED = colorsLED[color]
            colorCSS = colorsCSS[color]
            setRowColor(row_ind, colorLED, colorCSS);
        }
    }
    timer = setInterval(nextRow, waveRate)
}

function startTheRainbow() {
    clearInterval(timer);
    c = -1
    timer = setInterval(function() {
        for (row in seats_by_row) {
            index = getRowIndex(row) || 0
            if (index >= 1 && index <= rows.length) {
                c = (c + 1) % colors.length
                color = colors[c]
                colorLED = colorsLED[color]
                colorCSS = colorsCSS[color]
                setRowColor(index, colorLED, colorCSS);
            }
        }
    }, RAINBOW_RATE);
}


//***************************//
//  PAPARAZZI and FLICKER   //
//*************************//

var probLevel = 0
var prob = probMeter[probLevel]

function startPaparazzi() {
    clearInterval(timer);
    Blackout(function() {
        timer = setInterval(function() {
            command = "37 37 2 " + PAPARAZZI_LED.join(" ") + " " + prob.toString(16).toUpperCase() + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                //console.log(data)
                setTimeout(Blackout, PAPARAZZI_RATE / 2)
                for (i in seats) {
                    $this = $('#' + i)
                    if (Math.random() < prob / 255) {
                        flash($this, "#FFFFFF")
                    }
                }
            })
        }, PAPARAZZI_RATE)
    })
}

function startFlicker(color) {
    clearInterval(timer)
    colorLED = colorsFlicker[color]
    colorCSS = colorsCSS[color]
    Blackout(function() {
        timer = setInterval(function() {
            command = "37 37 2 " + colorLED.join(" ") + " " + prob.toString(16).toUpperCase() + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                timeout = setTimeout(Blackout, PAPARAZZI_RATE / 2)
                for (i in seats) {
                    $this = $('#' + i)
                    if (Math.random() < prob / 255) {
                        flash($this, colorCSS)
                    }
                }
            })
        }, PAPARAZZI_RATE)
    })
}

//********************//
//  RANDOM TWINKLE   //
//*******************//

var brightnessLevel = brightnessMeter.length - 1
var twinkleIntervalLevel = 0
var twinkleBrightness = brightnessMeter[brightnessLevel]
var twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]

function startTwinkle() {
    $("#twinkle-rate").html(Math.round(10000 / twinkleInterval) / 10 + " Hz")
    timer = setInterval(function() {
        command = "37 37 4 " + twinkleBrightness.toString(16).toUpperCase() + " 2B"
        sendData = {
            s: command
        }
        $.get('/manualserial', sendData, function(data) {
            //console.log(data)
            for (i in seats) {
                $this = $('#' + i)
                seatColor = getRandomColor();
                setSeatColorBrightness($this, seatColor, 0.3 + 0.7 * twinkleBrightness / 255);
            }
        })
    }, twinkleInterval)
}

function teamTwinkle() {
    clearInterval(timer)
    var command = "37 37 4 " + twinkleBrightness.toString(16).toUpperCase() + " 2B"
    sendData = {
        s: command
    }
    $.get('/manualserial', sendData, function(data) {
        //console.log(data)
        for (i in seats) {
            $this = $('#' + i)
            seatColor = getRandomColor();
            setSeatColorBrightness($this, seatColor, 0.3 + 0.7 * twinkleBrightness / 255);
        }
        clearInterval(timer)
        var c = Math.floor(Math.random() * colors.length)
        var P = 60
        var shuffled_colors = shuffle(colors);
        timer = setInterval(function() {
            c = (c + 1) % colors.length
            var colorLED = colorsFlicker[shuffled_colors[c]]
            var colorCSS = colorsCSS[shuffled_colors[c]]
            var command = "37 37 2 " + colorLED.join(" ") + " " + P.toString(16).toUpperCase() + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                for (i in seats) {
                    $this = $('#' + i)
                    if (Math.random() < P / 255) {
                        flash($this, colorCSS)
                    }
                }
            })
        }, twinkleInterval)
    })
}

//***************************//
//    PROPAGATE COLORS      //
//*************************//

function propagateRandom(color) {
    clearInterval(timer)
    colorLED = colorsFlicker[color]
    colorCSS = colorsCSS[color]
    var P = PROPAGATE_PROB
    timer = setInterval(function() {
        command = "37 37 2 " + colorLED.join(" ") + " " + P.toString(16).toUpperCase() + " 2B"
        sendData = {
            s: command
        }
        if (P < 0.5 * 255) {
            $.get('/manualserial', sendData, function(data) {
                for (i in seats) {
                    $this = $('#' + i)
                    if (Math.random() < P / 255) {
                        flash($this, colorCSS)
                    }
                }
                P = Math.round(P * 1.2)
                if (escapeVals.indexOf(P) > -1) {
                    P -= 1;
                }
            })
        } else {
            clearInterval(timer)
            AllOn(colorLED, colorCSS, function() {
                AllOnSpam(colorLED, colorCSS)
            })
            return;
        }
    }, FADE_RATE);
}

function startPropagate(color) {
    clearInterval(timer)
    colorLED = colorsLED[color]
    colorCSS = colorsCSS[color]
    var row_i = 0
    nextRow = function(pause, row_i) {
        console.log(pause)
        if (row_i < rows.length) {
            row_i += 1
            setRowColor(row_i, colorLED, colorCSS)
            timer = setTimeout(function() {
                nextRow(Math.max(100, pause * 0.92), row_i)
            }, pause)
        } else {
            clearInterval(timer)
            AllOnSpam(colorLED, colorCSS)
            return;
        }
    }
    nextRow(PROPAGATE_RATE, 0);
}

function startRetract() {
    clearInterval(timer)
    var row_i = rows.length + 1
    nextRow = function(pause, row_i) {
        if (row_i > 1) {
            row_i -= 1
            setRowColor(row_i, BLACKOUT_LED, "#333333")
            timer = setTimeout(function() {
                nextRow(Math.max(100, pause * 0.9), row_i)
            }, pause)
        } else {
            clearInterval(timer)
            $(".blackout-btn").click();
            return;
        }
    }
    nextRow(PROPAGATE_RATE, rows.length + 1)
}

function FadeDown() {
    clearInterval(timer)
    AllOn(PAPARAZZI_LED, "#FFFFFF")
    brightness = 280
    timer = setInterval(function() {
        if (brightness >= 16) {
            brightness = Math.round(brightness * FADE_FACTOR)
            brightnessR = Math.round(brightness * RED_ATTENUATION_FACTOR)
            if (escapeVals.indexOf(brightness) > -1) {
                brightness += 1
            }
            if (escapeVals.indexOf(brightnessR) > -1) {
                brightnessR -= 1
            }
            hex = brightness.toString(16).toUpperCase()
            hexR = brightnessR.toString(16).toUpperCase()
            command = "37 37 0 " + hexR + " " + hex + " " + hex + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                //console.log(data)
                hex = Math.round((51 + brightness / 255 * (255 - 51))).toString(16)
                $(".seat").css("background-color", "#" + hex + hex + hex)
            })
        } else {
            clearInterval(timer)
            $(".blackout-btn").click();
        }
    }, FADE_RATE);
}


//***************************//
//   CONVENIENCE MACROS     //
//*************************//

function Blackout(callback) {
    $.get('/manualserial', BLACKOUT_COMMAND, function(data) {
        //console.log(data)
        $(".seat").css("background-color", "#333333")
        if (callback) {
            callback();
        }
        return;
    })
}

function Dim(callback) {
    $.get('/manualserial', DIM_COMMAND, function(data) {
        //console.log(data)
        $(".seat").css("background-color", "#666666")
        if (callback) {
            callback();
        }
        return;
    })
}

function AllOn(colorLED, colorCSS, callback) {
    clearInterval(timer)
    clearTimeout(timeout)
    command = "37 37 0 " + colorLED.join(" ") + " 2B"
    sendData = {
        s: command
    }
    $.get('/manualserial', sendData, function(data) {
        //console.log(data)
        $(".seat").css("background-color", colorCSS)
        if (callback) {
            callback();
        }
    })
}

function AllOnSpam(colorLED, colorCSS, callback) {
    clearInterval(timer)
    clearTimeout(timeout)
    command = "37 37 0 " + colorLED.join(" ") + " 2B"
    sendData = {
        s: command
    }
    timer = setInterval(function() {
        $.get('/manualserial', sendData, function(data) {
            //console.log(data)
            $(".seat").css("background-color", colorCSS)
            if (callback) {
                callback();
            }
        })
    }, 500);
}

/*function startTheBacon(x, y) {
    baconOriginX = x;
    baconOriginY = y;
    setDateStart = new Date().getTime();
    clearInterval(timer);
    timer = setInterval(function() {
        dateOffset = new Date().getTime();
        pulseDist = -(dateOffset - setDateStart) / 20
        for (i in seats) {
            $this = $('#' + i)
            distToBacon = Math.sqrt(Math.pow((baconOriginX - seats[i].x), 2) + Math.pow((baconOriginY - seats[i].y), 2))
            if (Math.abs(distToBacon - pulseDist) % baconRingDistance < baconTolerance) {
                setSeatColor($this, '#fff');
            } else {
                setSeatColor($this, '#333');
            }
        }
    }, animationRefreshRate);
}

animationRefreshRate = 150

/*function startTheSlots(timeStayRandom, timeToReveal, finalColor) {
    setDateStart = new Date().getTime() + timeToReveal;
    clearInterval(timer);
    timer = setInterval(function() {
        dateOffset = new Date().getTime();
        timeDiff = setDateStart - dateOffset
        for (i in seats) {
            $this = $('#' + i)
            if (Math.random() * (timeDiff) / 30 > 10 || timeDiff > (timeToReveal - timeStayRandom)) {
                seatColor = getRandomColor();
            } else {
                seatColor = finalColor;
            }
            setSeatColor($this, seatColor);
        }
    }, animationRefreshRate)
}*/

/*function getSolidColor(x, y, offset) {
    hue = (((offset) * 100) % 100) / 100
    rgbColor = HSLToRGB(hue, 0.85, 0.5)
    return '#' + rgbColor[0].toString(16) + rgbColor[1].toString(16) + rgbColor[2].toString(16);
}*/

/* $(document).on('click', '.map', function(e) {
    if (allowBeaconStart) {
        x = e.pageX - 250;
        y = e.pageY;
        startTheBacon(x, y)
    }
}) */


//***************************//
//  RANDOM COLOR GENERATION //
//*************************//

function getRandomTeamColor() {
    return colors[Math.floor(Math.random() * colors.length)]
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function init() {
    // startTheSlots(2000, 4000, 'red'); // 3 seconds
}

var active;
$(document).on('click', '.command', function(e) {
    $this = $(this)
    var f = $this.data('func')
    $('.command').removeClass('active')
    $this.addClass('active')
    active = f
    $('.option2').hide();
    $('.' + f + '-options').show();
    $("#waverate").html(Math.round(10000 / waveRate) / 10 + " Hz")
    $(".prob").html(prob + " / 255")
    $("#twinkle-brightness").html(twinkleBrightness + " / 255")
    $("#twinkle-rate").html(Math.round(10000 / twinkleInterval) / 10 + " Hz")
    allowBeaconStart = false;
    switch (f) {
        case 'wave':
            break;
        case 'beacon':
            allowBeaconStart = true;
            break;
        case 'slots':
            break;
    }
    console.log(active)
})

$(document).on('click', '.allon-btn', function(e) {
    startLights($(this))
})

$(document).on('click', '.run-btn', function(e) {
    startLights($(this))
})

$(document).on('click', '.color-btn', function(e) {
    startLights($(this))
})

$(document).on('click', '.blackout-btn', function(e) {
    clearInterval(timer);
    Blackout()
    timer = setInterval(Blackout, 750)
});

$(document).on('click', '.dim-btn', function(e) {
    clearInterval(timer)
    Dim()
    timer = setInterval(Dim, 750)
})

$(document).on('click', '.fade-btn', function(e) {
    clearInterval(timer)
    FadeDown()
})

$(document).on('keydown', '.prompt', function(e) {
    $r = $('.response')
    $p = $('.prompt')
    if (e.which == 13) {
        sendData = {
            s: $p.val()
        }
        $.get('/manualserial', sendData, function(data) {
            $r.prepend('<span class="userInput">> ' + $p.val() + '</span><br />');
            $r.prepend(data + '<br />');
            $p.val('');
        })
        lastInputPrompt = $(this).val();
    } else if (e.which == 38) {
        $p.val(lastInputPrompt);
    } else if (e.which == 27) {
        $('.bash').hide();
        $('#F_11').removeClass('view-larger')
        $('.response').text('')
    }
});

var holding = false;
var keydown = false;
$(document).on('keydown', function(e) {
    if (active == "twinkle") {
        if (e.which == 87) {
            // "W" - increase brightness
            brightnessLevel = Math.min(brightnessLevel + 1, brightnessMeter.length - 1);
            twinkleBrightness = brightnessMeter[brightnessLevel];
            $("#twinkle-brightness").html(twinkleBrightness);
        } else if (e.which == 83) {
            // "S" - decrease brightness
            brightnessLevel = Math.max(brightnessLevel - 1, 0);
            twinkleBrightness = brightnessMeter[brightnessLevel];
            $("#twinkle-brightness").html(twinkleBrightness);
        } else if (e.which == 68) {
            // "D" - faster twinkle rate
            twinkleIntervalLevel = Math.max(twinkleIntervalLevel - 1, 0);
            twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel];
            clearInterval(timer);
            startTwinkle();
        } else if (e.which == 65) {
            // "A" - slower twinkle rate
            twinkleIntervalLevel = Math.min(twinkleIntervalLevel + 1, twinkleIntervalMeter.length - 1);
            twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel];
            clearInterval(timer)
            startTwinkle();
        }
    } else if (active == "paparazzi" || active == "flicker") {
        if (e.which == 87) {
            // "W" - increase probability
            probLevel = Math.min(probLevel + 1, probMeter.length - 1)
        } else if (e.which == 83) {
            // "S" - decrease probability
            probLevel = Math.max(0, probLevel - 1)
        }
        prob = probMeter[probLevel];
        $(".prob").html(prob);
    } else if (active == "wave") {
        if (e.which == 87) {
            // "W" - increase rate
            waveIntervalLevel = Math.max(waveIntervalLevel - 1, 0)
        } else if (e.which == 83) {
            // "S" - decrease rate
            waveIntervalLevel = Math.min(waveIntervalMeter.length - 1, waveIntervalLevel + 1)
        }
        waveRate = waveIntervalMeter[waveIntervalLevel]
        $("#waverate").html(Math.round(10000 / waveRate) / 10 + " Hz")
        startTheWave()
    }
    if (e.which == 76 && !holding && !keydown) {
        // "L" for white light
        clearInterval(timer);
        holding = true;
        AllOn(PAPARAZZI_LED, "#FFFFFF");
    } else if (e.which == 88 && !holding && !keydown) {
        // "X" for blackout
        clearInterval(timer);
        Blackout();
    } else if (e.which == 84) {
        // "T" for twinkle
        clearInterval(timer);
        $("button[data-func='team-twinkle']").click();
        teamTwinkle();
    } else if (String.fromCharCode(e.which) in coloredKeys && !holding && !keydown) {
        holding = true
        color = coloredKeys[String.fromCharCode(e.which)]
        if (active == "flicker") {
            clearInterval(timer);
            startFlicker(color);
            holding = false;
        } else if (active == "propagate") {
            console.log(String.fromCharCode(e.which))
            startPropagate(color);
            holding = false;
        } else if (active == "propagate-random") {
            propagateRandom(color);
            holding = false;
        } else if (active == "allon") {
            clearInterval(timer);
            AllOnSpam(colorsLED[color], colorsCSS[color]);
            holding = false;
        } else {
            clearInterval(timer);
            AllOn(colorsLED[color], colorsCSS[color]);
        }
    }
    keydown = true
}).on("keyup", function(e) {
    console.log(e.which)
    if (holding) {
        holding = false;
        keydown = false;
        Blackout();
    } else if (keydown) {
        keydown = false;
    }
    if (e.which == 13) {
        // ENTER to run active command
        $(".run-btn[data-func='" + active + "']").click();
    } else if (e.which == 27) {
        // ESC key
        RESET();
    } else if (e.which == 188) {
        $("button.command[data-func='propagate']").click();
    } else if (e.which == 190) {
        $("button.command[data-func='retract']").click();
        startRetract();
    }
});

function startLights($this) {
    var f = $this.data('func')
    clearInterval(timer);
    switch (f) {
        case 'wave':
            Blackout();
            $("#waverate").html(Math.round(10000 / waveRate) / 10 + " Hz");
            startTheWave();
            break;
        case 'rainbow':
            Blackout();
            startTheRainbow();
            break;
        case 'twinkle':
            $("#twinkle-brightness").html(twinkleBrightness);
            $("#twinkle-rate").html(Math.round(10000 / twinkleInterval) / 10 + " Hz");
            startTwinkle();
            break;
        case 'team-twinkle':
            teamTwinkle();
            break;
        case 'paparazzi':
            Blackout();
            $(".prob").html(prob);
            startPaparazzi();
            break;
        case 'flicker':
            color = $this.data("color");
            startFlicker(color)
            break;
        case 'allon':
            color = $this.data("color")
            colorLED = colorsLED[color]
            colorCSS = colorsCSS[color]
            AllOnSpam(colorLED, colorCSS)
            break;
        case 'beacon':
            break;
        case 'propagate':
            color = $this.data("color")
            console.log(color)
            startPropagate(color);
            break;
        case 'propagate-random':
            color = $this.data("color")
            propagateRandom(color)
            break;
        case 'retract':
            startRetract();
            break;
        case 'slots':
            color = $this.css('background-color');
            startTheSlots(2000, 4000, color);
            break;
    }
}

$(function() {
    var $mapContainer = $('.map');
    for (i in seats) {
        var $newSeat = $('<div class="seat" id="' + i + '" data-x="' + seats[i].x + '" data-y="' + seats[i].y + '" class="seat"></div>');
        seatLeft = seats[i].x;
        seatTop = seats[i].y;
        $newSeat.css({
            left: seatLeft,
            top: seatTop
        });
        $mapContainer.append($newSeat)
        audWidth = Math.max(audWidth, seatLeft);
        audHeight = Math.max(audHeight, seatTop);
    }
    init();
});

RESET = function() {
    $(".command").removeClass("active")
    active = "";
    clearInterval(timer)
}
