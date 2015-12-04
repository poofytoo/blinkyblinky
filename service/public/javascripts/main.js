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

var escapeVals = [43, 47, 53, 55]

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

function setRowColor(row_ind, colorLED, colorCSS) {
    command = "37 37 1 " + colorLED.join(" ") + " " + row_ind.toString(16).toUpperCase() + " 2B"
    sendData = {
        s: command
    }
    $.get('/manualserial', sendData, function(data) {
        console.log(data)
        rowId = getRowId(row_ind)
        for (i in seats_by_row[rowId]) {
            index = parseInt(i) + 1
            $this = $('#' + seats_by_row[rowId][i].id)
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

var waveIntervalMeter = [1000 / 20, 1000 / 15, 1000 / 12.5, 1000 / 10, 1000 / 7.5, 1000 / 5.0, 1000 / 2.5]
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
        }
        if (r == 0) {
            Blackout()
            c = Math.floor(Math.random() * colors.length)
            up = true
        }
        row_ind = getRowIndex(rows[r]) || 0
        if (row_ind >= 1 && row_ind <= rows.length) {
            c = (c + 1) % colors.length
            color = colors[c]
            colorLED = colorsLED[color]
            colorCSS = colorsCSS[color]
            setRowColor(row_ind, colorLED, colorCSS);
        }
    }
    timer = setInterval(nextRow, waveRate)
}

var brightnessMeter = [2, 5, 10, 20, 40, 80, 160, 255]
var brightnessLevel = brightnessMeter.length - 1
var twinkleIntervalMeter = [1000 / 15, 1000 / 12.5, 1000 / 10, 1000 / 7.5, 1000 / 5, 1000 / 3, 1000 / 2, 1000]
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

var probMeter = [10, 40, 70, 100, 130, 160, 190, 220, 255]
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
            command = "37 37 2 32 50 50 " + prob.toString(16).toUpperCase() + " 2B"
            sendData = {
                s: command
            }
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
    }, 250)
}

function startPropogate(interval, colorLED, colorCSS) {
    clearInterval(timer)
    nextRow = function(pause, row_i) {
        if (row_i < rows.length) {
            row_i += 1
            setRowColor(row_i, colorLED, colorCSS)
            timer = setTimeout(function(){
                nextRow(pause * 0.875, row_i)
            }, pause)
        } else {
            clearInterval(timer)
            AllOn(colorLED, colorCSS)
        }
    }
    nextRow(interval, 0);
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
}*/

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
    $("#waverate").html(Math.round(10000 / waveRate) / 10 + " Hz")
    $("#prob").html(prob + " / 255")
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

function Blackout() {
    $.get('/manualserial', BLACKOUT_COMMAND, function(data) {
        console.log(data)
        for (i in seats) {
            $this = $('#' + i)
            setSeatColor($this, '#333333')
        }
    })
}

function Dim() {
    $.get('/manualserial', DIM_COMMAND, function(data) {
        console.log(data)
        for (i in seats) {
            $this = $('#' + i)
            setSeatColor($this, '#666666')
        }
    })
}

function AllOn(colorLED, colorCSS) {
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
}

$(document).on('click', '.blackout-btn', function(e) {
    Blackout()
    clearInterval(timer);
    timer = setInterval(Blackout, 750)
});

$(document).on('click', '.dim-btn', function(e) {
    Dim()
    clearInterval(timer)
    timer = setInterval(Dim, 750)
})

$(document).on('click', '.fade-btn', function(e) {
    clearInterval(timer);
    brightness = 256
    timer = setInterval(function() {
        if (brightness >= 16) {
            brightness = Math.round(brightness * 0.9)
            brightnessR = Math.round(brightness * 0.6)
            if (brightness in escapeVals) {
                brightness -= 1
            }
            if (brightnessR in escapeVals) {
                brightnessR -= 1
            }

            hex = brightness.toString(16).toUpperCase()
            hexR = brightnessR.toString(16).toUpperCase()
            command = "37 37 0 " + hexR + " " + hex + " " + hex + " 2B"
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
            Dim();
        }
    }, 150);
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
            startPaparazzi(250)
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
            startPropogate(300, colorLED, colorCSS);
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
