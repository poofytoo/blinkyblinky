// main.js

var state = '';

var audWidth = 0;
var audHeight = 0;
var setDateStart = new Date().getTime();
var animationRefreshRate = 80;

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

var updateRate = 50;
var prevF11Color = '';

$(document).bind('keydown', 'space', function () {
  $('#F_11').addClass('view-larger')
});

updateSeat = setInterval(function() {
  currF11Color = $('#F_11').css('background-color');
  if (prevF11Color != currF11Color) {
    prevF11Color = currF11Color;
    results = currF11Color.replace('rgb(', '').replace(' ','').replace('+','').replace(')','').split(',')
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

function startTheWave() {
  setDateStart = new Date().getTime();
  clearInterval(timer);
  timer = setInterval(function() {
    dateOffset = new Date().getTime();
    for (i in seats) {
      $this = $('#' + i)
      seatColor = getSolidColor(seats[i].x, seats[i].y, (dateOffset-setDateStart)/1000);
      setSeatColor($this, seatColor);
    }
  }, animationRefreshRate);
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
  hue = (((x/audWidth + offset)*100)%100)/100
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


function startLights($this) {
  var f = $this.data('func')
  clearInterval(timer);
  switch(f) {
    case 'wave':
      startTheWave();
      break;
    case 'allon':
      color = $this.css('background-color');
      for (i in seats) {
        $this = $('#' + i)
        setSeatColor($this, color)
      } 
      break;
    case 'beacon':
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