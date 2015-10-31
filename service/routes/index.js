var express = require('express');
var router = express.Router();

function hex2a(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
Send a thing! Send a thing! Do it! Do it!
Manuallllly!
*/
router.get('/manualserial', function(req, res, next) {
  bytes = req.query.s.replace(/\s\s+/g, ' ').split(' ')
  bytesDec = []
  newBytes = []
  for (i in bytes) {
    if (bytes[i]) {
      bytesDec.push(parseInt(bytes[i], 16))
      newBytes.push(bytes[i])
    }
  }
  if (s) {
    s.write(bytesDec, function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
    res.send('ok<br />hex: [' + newBytes + ']<br />dec: [' + bytesDec + ']')
  } else {
    res.send('no serial<br />hex: [' + newBytes + ']<br />dec: [' + bytesDec + ']')
  }
})

router.get('/setsingle', function(req, res, next) {
  // black

  if ( parseInt(req.query.r) < 52 && parseInt(req.query.b) < 52 && parseInt(req.query.g) < 52) {

    s.write([0], function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
  } else {
  // 1 - 40, 41 - 80, 81 - B0
  // 64, 128, 192
    r = parseInt(req.query.r/4 + 1)
    s.write([r], function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });

    g = parseInt(req.query.g/4 + 65)
    s.write([g], function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });


    b = parseInt(req.query.b/4 + 129)
    s.write([b], function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });

  console.log(r,g,b)
  }

  // console.log(r,g,b)
  // console.log(datar, datab, datag)
  res.send('done');

});

module.exports = router;
