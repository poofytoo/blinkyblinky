// main.js

var state = '';

var audWidth = 0;
var audHeight = 0;
var setDateStart = new Date().getTime();
var animationRefreshRate = 150;

var baconOriginX = 0;
var baconOriginY = 0;
var baconTolerance = 30;
var baconRingDistance = 120;

var allowBeaconStart = false;
var timer;

function componentToHex(c) {
    var hex = parseInt(c).toString(16).toUpperCase();
    return hex.length == 1 ? "0" + hex : hex;
}

function setSeatColor($this, colorCSS) {
    $this.css('background-color', colorCSS)
}

function setSeatColorBrightness($this, colorCSS, seatAlpha) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorCSS);
    result = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }
    $this.css('background-color', "rgba(" + result.r + ", " + result.g + ", " + result.b + ", " + seatAlpha + ")")
}

function setRowColor(row, colorLED, colorCSS) {
    command = "37 37 1 " + colorLED.join(" ") + " " + getRowIndex(row).toString(16).toUpperCase() + " 2B"
    sendData = {
        s: command
    }
    $.get('/manualserial', sendData, function(data) {
        console.log(data)
        for (i in seats_by_row[row]) {
            index = parseInt(i) + 1
            $this = $('#' + seats_by_row[row][i].id)
            $this.css('background-color', colorCSS)
        }
    })
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

/*updateSeat = setInterval(function() {
    currF11Color = $('#F_11').css('background-color');
    if (prevF11Color != currF11Color) {
        prevF11Color = currF11Color;
        results = currF11Color.replace(/rgb(a)?\(/, '').replace(' ', '').replace('+', '').replace(')', '').split(',')
        data = {
            r: results[0],
            g: results[1],
            b: results[2].replace(' ', '')
        }
        $.get('/setsingle', data, function(output) {
            console.log(output)
        })
    }
}, updateRate);*/

var waveIntervalMeter = [1000 / 20, 1000 / 15, 1000 / 10, 1000 / 5, 1000 / 4, 1000 / 2.5, 1000 / 2, 1000]
var waveIntervalLevel = 4
var waveRate = waveIntervalMeter[waveIntervalLevel]

function startTheWave() {
    clearInterval(timer);
    c = -1
    timer = setInterval(function() {
        for (row in seats_by_row) {
            index = getRowIndex(row)
            if (index >= 1 && index <= 14) {
                c = (c + 1) % colors.length
                color = colors[c]
                colorLED = colorsLED[color]
                colorCSS = colorsCSS[color]
                setRowColor(row, colorLED, colorCSS);
            }
        }
    }, waveRate);
}

var brightnessMeter = [0, 10, 20, 40, 80, 160, 255]
var brightnessLevel = brightnessMeter.length - 1
var twinkleIntervalMeter = [1000 / 20, 1000 / 15, 1000 / 10, 1000 / 5, 1000 / 4, 1000 / 2.5, 1000 / 2, 1000]
var twinkleIntervalLevel = 0
var twinkleBrightness = brightnessMeter[brightnessLevel]
var twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]

function startTwinkle(interval) {
    $("#twinkle-rate").html(Math.round(10000 / twinkleInterval) / 10 + " Hz")
    timer = setInterval(function() {
        command = "37 37 4 " + twinkleBrightness.toString(16).toUpperCase() + " 2B"
        sendData = {
            s: command
        }
        $.get('/manualserial', sendData, function(data) {
            console.log(data)
            for (i in seats) {
                $this = $('#' + i)
                seatColor = getRandomColor();
                setSeatColorBrightness($this, colorsCSS[seatColor], 0.3 + 0.7 * twinkleBrightness / 255);
            }
        })
    }, interval)
}

var probMeter = [255 * 0.1, 255 * 0.2, 255 * 0.3, 255 * 0.4, 255 * 0.5, 255 * 0.6, 255 * 0.7, 255 * 0.8, 255 * 0.9, 255 * 1.0]
var probLevel = 0
var prob = probMeter[probLevel]

function startPaparazzi(interval) {
    clearInterval(timer);
    $.get('/manualserial', BLACKOUT_COMMAND, function(data) {
        console.log(data)
        for (i in seats) {
            $this = $('#' + i)
            setSeatColor($this, '#333333')
        }
        timer = setInterval(function() {
            command = "37 37 3 40 50 50 " + Math.round(prob).toString(16).toUpperCase() + " 2B"
            sendData = {
                    s: command
                }
                // console.log(command)
            $.get('/manualserial', sendData, function(data) {
                console.log(data)
                for (i in seats) {
                    $this = $('#' + i)
                    if (Math.random() < prob / 255) {
                        flash($this, "#FFFFFF")
                    }
                }
            })
        }, interval)
    })
}

function flash($this, seatColor) {
    $this.css('background-color', "#FFFFFF")
    setTimeout(function() {
        $this.css('background-color', "#333333")
    }, 100)
}

function startPropogate(interval, colorLED, colorCSS) {
    clearInterval(timer)
    var row_ind = 0
    timer = setInterval(function() {
        if (row_ind < 14) {
            row_ind += 1
        } else {
            clearInterval(timer)
        }
        setRowColor(getRowId(row_ind), colorLED, colorCSS)
    }, interval)
}

function startTheBacon(x, y) {
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

function startTheSlots(timeStayRandom, timeToReveal, finalColor) {
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
}

function getSolidColor(x, y, offset) {
    hue = (((offset) * 100) % 100) / 100
    rgbColor = HSLToRGB(hue, 0.85, 0.5)
    return '#' + rgbColor[0].toString(16) + rgbColor[1].toString(16) + rgbColor[2].toString(16);
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)]
}

function init() {
    // startTheSlots(2000, 4000, 'red'); // 3 seconds
}

$(document).on('click', '.map', function(e) {
    if (allowBeaconStart) {
        x = e.pageX - 250;
        y = e.pageY;
        startTheBacon(x, y)
    }
})

var active;
$(document).on('click', '.command', function(e) {
    $this = $(this)
    var f = $this.data('func')
    $('.command').removeClass('active')
    $this.addClass('active')
    active = f
    $('.option2').hide();
    $('.' + f + '-options').show();
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

const BLACKOUT_COMMAND = {
    s: "37 37 4 0 2B"
}
$(document).on('click', '.blackout-btn', function(e) {
    clearInterval(timer);
    timer = setInterval(function() {
        $.get('/manualserial', BLACKOUT_COMMAND, function(data) {
            console.log(data)
            for (i in seats) {
                $this = $('#' + i)
                setSeatColor($this, '#333333')
            }
        })
    }, 400)
});

const DIM_COMMAND = {
    s: "37 37 0 6 9 9 2B"
}
$(document).on('click', '.dim-btn', function(e) {
    clearInterval(timer);
    timer = setInterval(function() {
        $.get('/manualserial', DIM_COMMAND, function(data) {
            console.log(data)
            for (i in seats) {
                $this = $('#' + i)
                setSeatColor($this, '#666666')
            }
        })
    }, 400)
})

$(document).on('click', '.fade-btn', function(e) {
    clearInterval(timer);
    brightness = 80
    timer = setInterval(function() {
        if (brightness >= 8) {
            brightness -= 8
            hex = brightness.toString(16).toUpperCase()
            command = "37 37 0 " + hex + " " + hex + " " + hex + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                console.log(data)
                for (i in seats) {
                    $this = $('#' + i)
                    hex = Math.max(51, brightness).toString(16)
                    setSeatColor($this, "#" + hex + hex + hex)
                }
            })
        } else {
            clearInterval(timer)
            $('.blackout-btn').click()
        }
    }, 250);
});

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

$(document).on('keydown', function(e) {
    if (active == "twinkle") {
        if (e.which == 87) {
            // "W" - increase brightness
            brightnessLevel = Math.min(brightnessLevel + 1, brightnessMeter.length - 1)
            twinkleBrightness = brightnessMeter[brightnessLevel]
            $("#twinkle-brightness").html(twinkleBrightness)
        } else if (e.which == 83) {
            // "S" - decrease brightness
            brightnessLevel = Math.max(brightnessLevel - 1, 0)
            twinkleBrightness = brightnessMeter[brightnessLevel]
            $("#twinkle-brightness").html(twinkleBrightness)
        } else if (e.which == 68) {
            // "D" - faster twinkle rate
            twinkleIntervalLevel = Math.max(twinkleIntervalLevel - 1, 0)
            twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]
            clearInterval(timer)
            startTwinkle(twinkleInterval)
        } else if (e.which == 65) {
            // "A" - slower twinkle rate
            twinkleIntervalLevel = Math.min(twinkleIntervalLevel + 1, twinkleIntervalMeter.length - 1)
            twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]
            clearInterval(timer)
            startTwinkle(twinkleInterval)
        }
    } else if (active == "paparazzi") {
        if (e.which == 87) {
            // "W" - increase probability
            probLevel = Math.min(probLevel + 1, probMeter.length - 1)
        } else if (e.which == 83) {
            // "S" - decrease probability
            probLevel = Math.max(0, probLevel - 1)
        }
        prob = probMeter[probLevel]
        $("#prob").html(prob)
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
})

function startLights($this) {
    var f = $this.data('func')
    clearInterval(timer);
    switch (f) {
        case 'wave':
            $("#waverate").html(Math.round(10000 / waveRate) / 10 + " Hz")
            startTheWave();
            break;
        case 'twinkle':
            $("#twinkle-brightness").html(twinkleBrightness)
            $("#twinkle-rate").html(Math.round(10000 / twinkleInterval) / 10 + " Hz")
            startTwinkle(twinkleInterval);
            break;
        case 'paparazzi':
            $("#prob").html(prob)
            startPaparazzi(400)
        case 'allon':
            color = $this.data("color")
            colorLED = colorsLED[color]
            colorCSS = colorsCSS[color]
            command = "37 37 0 " + colorLED.join(" ") + " 2B"
            sendData = {
                s: command
            }
            $.get('/manualserial', sendData, function(data) {
                console.log(data)
                for (i in seats) {
                    $this = $('#' + i)
                    setSeatColor($this, colorCSS)
                }
            })
            break;
        case 'beacon':
            break;
        case 'propogate':
            color = $this.data("color")
            colorLED = colorsLED[color]
            colorCSS = colorsCSS[color]
            startPropogate(250, colorLED, colorCSS);
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
        var $newSeat = $('<div id="' + i + '" data-x="' + seats[i].x + '" data-y="' + seats[i].y + '" class="seat"></div>');
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
