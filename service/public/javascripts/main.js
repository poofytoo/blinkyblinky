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

function setSeatColor($this, seatColor) {
  $this.css('background-color', seatColor)
  // Use this to transmit colors to the board until websockets
}

function setSeatColorBrightness($this, seatColor, seatAlpha) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(seatColor);
  result = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
  }
  $this.css('background-color', "rgba(" + result.r + ", " + result.g + ", " + result.b + ", " + seatAlpha + ")")
}

function setRowColor(row, color) {
  for (i in seats_by_row[row]) {
    index = parseInt(i) + 1
    $this = $('#' + seats_by_row[row][i].id)
    $this.css('background-color', color)
  }
  command = "37 37 1 " + color.substring(1,3) + " " + color.substring(3,5) + " " + color.substring(5,7) + " " + getRowIndex(row) + " 2B"
    sendData = {s:command}
    // console.log(command)
    $.get('/manualserial', sendData, function(data) {
      //$r.prepend('<span class="userInput">> ' + command + '</span><br />');
      //$r.prepend(data + '<br />');
      //$p.val('');
      // console.log(data)
    })
}

var updateRate = 50;
var prevF11Color = '';
var lastInputPrompt = '';

$(document).on('keydown', 'body', function (e) {
  if (e.which == 32) {
    $('#F_11').addClass('view-larger')
    $('.bash').show();
    $('.bash').find('input').focus();
  }
});

updateSeat = setInterval(function() {
  currF11Color = $('#F_11').css('background-color');
  if (prevF11Color != currF11Color) {
    prevF11Color = currF11Color;
    results = currF11Color.replace(/rgb(a)?\(/, '').replace(' ','').replace('+','').replace(')','').split(',')
    data = {
      r: results[0],
      g: results[1],
      b: results[2].replace(' ', '')
    }
    $.get('/setsingle', data, function(output) {
      console.log(output)
    })
  }
}, updateRate);

waveRate = 500
function startTheWave() {
  setDateStart = new Date().getTime();
  clearInterval(timer);
  a = 0
  timer = setInterval(function() {
    dateOffset = new Date().getTime();
    for (row in seats_by_row) {
      index = getRowIndex(row)
      if (index >= 1 && index <= 14) {
        a += 0.8
        color = getSolidColor(seats_by_row[row][0].x, seats_by_row[row][0].y, (dateOffset-setDateStart)/1000 + a);
        setTimeout(setRowColor(row, color), waveRate)
      }
    }
    /*for (i in seats) {
      $this = $('#' + i)
      seatColor = getSolidColor(seats[i].x, seats[i].y, (dateOffset-setDateStart)/1000);
      setSeatColor($this, seatColor);
    }*/
  }, animationRefreshRate);
}

var brightnessMeter = [0, 10, 20, 40, 80, 160, 255]
var brightnessLevel = brightnessMeter.length - 1
var twinkleIntervalMeter = [1000/20, 1000/15, 1000/10, 1000/5, 1000/4, 1000/2.5, 1000/2, 1000]
var twinkleIntervalLevel = 0
var twinkleBrightness = brightnessMeter[brightnessLevel]
var twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]
var twinkleTimer;
function startTwinkle(interval) {
  $("#twinkle-rate").html(Math.round(10000/twinkleInterval)/10 + " Hz")
  twinkleTimer = setInterval(function() {
    command = "37 37 4 " + twinkleBrightness.toString(16) + " 2B"
    sendData = {s:command}
    // console.log(command)
    $.get('/manualserial', sendData, function(data) {
      console.log(data)
    })
    for (i in seats) {
      $this = $('#' + i)
      seatColor = getRandomColor();
      setSeatColorBrightness($this, seatColor, 0.3 + 0.7*twinkleBrightness/255);
    }
  }, interval)
}

function startPropogate(interval, color) {
  rgbColor = color.replace('rgb(', '').replace(' ','').replace('+','').replace(')','').split(',')
  function componentToHex(c) {
    var hex = parseInt(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  hexColor = '#' + componentToHex(rgbColor[0]) + componentToHex(rgbColor[1])+ componentToHex(rgbColor[2])
  var row_ind = 0
  timer = setInterval(function(){
    if (row_ind < 14) {
      row_ind += 1
    } else {
      clearInterval(timer)
    }
    console.log(row_ind)
    console.log(getRowId(row_ind))
    setRowColor(getRowId(row_ind), hexColor)
  }, interval)
}

function startTheBacon(x, y) {
  baconOriginX = x;
  baconOriginY = y;
  setDateStart = new Date().getTime();
  clearInterval(timer);
  timer = setInterval(function() {
    dateOffset = new Date().getTime();
    pulseDist = -(dateOffset-setDateStart)/20
    for (i in seats) {
      $this = $('#' + i)
      distToBacon = Math.sqrt(Math.pow((baconOriginX - seats[i].x), 2) + Math.pow((baconOriginY - seats[i].y), 2))
      if (Math.abs(distToBacon - pulseDist)%baconRingDistance < baconTolerance) {
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
      if (Math.random()*(timeDiff)/30 > 10 || timeDiff > (timeToReveal - timeStayRandom)) {
        seatColor = getRandomColor();
      } else {
        seatColor = finalColor;
      }
      setSeatColor($this, seatColor);
    }
  }, animationRefreshRate)
}

function getSolidColor(x, y, offset) {
  hue = (((offset)*100)%100)/100
  rgbColor = HSLToRGB(hue, 0.85, 0.5)
  return '#' + rgbColor[0].toString(16) + rgbColor[1].toString(16) + rgbColor[2].toString(16);
}

function getRandomColor() {
  rgbColor = HSLToRGB(Math.random(), 0.85, 0.5)
  return '#' + rgbColor[0].toString(16) + rgbColor[1].toString(16) + rgbColor[2].toString(16);
  }

function init () {
   // startTheSlots(2000, 4000, 'red'); // 3 seconds
}


$(document).on('click', '.map', function(e) {
  if (allowBeaconStart) {
    x = e.pageX - 250;
    y = e.pageY;
    startTheBacon(x, y)
  }
})

$(document).on('click', '.command', function(e) {
  $this = $(this)
  var f = $this.data('func')
  $('.command').removeClass('active')
  $this.addClass('active')
  $('.option2').hide();
  $('.' + f + '-options').show();
  allowBeaconStart = false;
  switch(f) {
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

$(document).on('click', '.blackout-btn', function(e) {
  clearInterval(timer);
  for (i in seats) {
    $this = $('#' + i)
    setSeatColor($this, '#333333')
  } 
})

$(document).on('keydown', '.prompt', function(e) {
  $r = $('.response')
  $p = $('.prompt')
  if (e.which == 13) {
    sendData = {s:$p.val()}
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

$(document).on('keydown', function(e){
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
    clearInterval(twinkleTimer)
    startTwinkle(twinkleInterval)
  } else if (e.which == 65) {
    // "A" - slower twinkle rate
    twinkleIntervalLevel = Math.min(twinkleIntervalLevel + 1, twinkleIntervalMeter.length - 1)
    twinkleInterval = twinkleIntervalMeter[twinkleIntervalLevel]
    clearInterval(twinkleTimer)
    startTwinkle(twinkleInterval)
  }
})

function startLights($this) {
  var f = $this.data('func')
  clearInterval(timer);
  switch(f) {
    case 'wave':
      clearInterval(twinkleTimer);
      startTheWave();
      break;
    case 'twinkle':
      $("#twinkle-brightness").html(twinkleBrightness)
      $("#twinkle-rate").html(Math.round(10000/twinkleInterval)/10 + " Hz")
      startTwinkle(twinkleInterval);
      break;
    case 'allon':
      clearInterval(twinkleTimer);
      color = $this.css('background-color');
      for (i in seats) {
        $this = $('#' + i)
        setSeatColor($this, color)
      } 
      break;
    case 'beacon':
      break;
    case 'propogate':
      clearInterval(twinkleTimer);
      color = $this.css('background-color');
      startPropogate(150, color);
      break;
    case 'slots':
      clearInterval(twinkleTimer);
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
    $newSeat.css({left: seatLeft, top: seatTop});
    $mapContainer.append($newSeat)
    audWidth = Math.max(audWidth, seatLeft);
    audHeight = Math.max(audHeight, seatTop);
  }

  init();
/*
  for (i in seats) {
    $this = $('#' + i)
    seatColor = getSolidColor(seats[i].x, seats[i].y);
    $this.css('background-color', seatColor)
  }
*/

});