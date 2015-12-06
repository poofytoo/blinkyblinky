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
    var hex = hexx.toString(); //force conversion
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
app.use(bodyParser.urlencoded({
    extended: false
}));
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

var isWin = /^win/.test(process.platform)

serialPort.list(function(err, ports) {
    ports.forEach(function(port) {
        port = port.comName;
        if (isWin && port.length > 0 || port.indexOf("usbserial") > -1) {
            console.log(port)
            startSerialPort(port);
            return
        }
    });
});

function startSerialPort(port) {
    s = new SerialPort(port, {
        baudrate: 1200
    });
    s.on("open", function() {
        console.log('open');
        /*
          serialPort.on('data', function(data) {
            console.log('data received: ' + data);
          });
        */
        /* ALL TEAM COLORS TEST */
        if (process.argv.indexOf("test") > -1) {
            var colors = ["red", "green", "blue"]
            var colorsLED = {
                "blue": [0, 0, 80],
                "green": [0, 80, 0],
                "orange": [64, 40, 0],
                "pink": [80, 32, 64],
                "purple": [22, 0, 66],
                "red": [80, 0, 0],
                "silver": [36, 72, 72],
                "yellow": [50, 72, 0]
            }
            c = -1
            setInterval(function() {
                c = (c + 1) % colors.length;
                data = [55, 55, 0, colorsLED[colors[c]][0], colorsLED[colors[c]][1], colorsLED[colors[c]][2], 43]
                s.write(data, function(err, results){
                  //console.log(results)
                })
            }, 500);
        } else {
            /* BLACKOUT */
            data = [55, 55, 0, 2, 10, 10, 43]
            s.write(data, function(err, results) {
                console.log("All lights blackout.");
            });
        }
    });

}


module.exports = app;
