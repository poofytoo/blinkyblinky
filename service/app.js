var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

function hex2a(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/setsingle', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
/*
*/
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
s = '';

serialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    port = port.comName;
    if (port.indexOf('usbserial') > -1) {
        startSerialPort(port);
        return;
    }
  });
});

function startSerialPort(port) {
  s = new SerialPort(port, {
    baudrate: 1200
  });
  s.on("open", function () {
    console.log('open');
    /*
    serialPort.on('data', function(data) {
      console.log('data received: ' + data);
    });
  */
    data = hex2a('00')
    s.write(data, function(err, results) {
        console.log(results);
    });
/*
    setTimeout(function() {
      data = hex2a('40')
      s.write(data, function(err, results) {
      });
    }, 100)

      setTimeout(function() {
      data = hex2a('70')
      s.write(data, function(err, results) {
      });
    }, 1000);
*/
      setInterval(function() {
        data = hex2a("C0")
        console.log(data);
        s.write([55, 55, 0, 50, 0, 0, 43], function(err, results) {
          console.log(results + 't');
        });
      }, 1000)

      setTimeout(function() {

      setInterval(function() {
        data = hex2a("C0")
        console.log(data);
        s.write([55, 55, 0, 0, 50, 0, 43], function(err, results) {
          console.log(results);
        });
      }, 1000)

      }, 300)


      setTimeout(function() {

      setInterval(function() {
        data = hex2a("C0")
        console.log(data);
        s.write([55, 55, 0, 0, 0, 50, 43], function(err, results) {
          console.log(results);
        });
      }, 1000)

      }, 600)

  });

}


module.exports = app;
