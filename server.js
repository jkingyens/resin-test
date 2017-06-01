// video camera

var fs = require('fs')
var RaspiCam = require("raspicam");
var camera = new RaspiCam({ 
  mode: 'photo',
  output: '/data/blah.jpg'
});

var Sound = require('node-arecord');
 
var sound = new Sound({
 debug: true,    // Show stdout 
 destination_folder: '/data',
 filename: 'recording.wav',
 alsa_format: 'dat',
 alsa_device: 'plughw:1,0'
});
 
sound.record();
 
setTimeout(function () {
    sound.pause(); // pause the recording after five seconds 
}, 5000);
 
setTimeout(function () {
    sound.resume(); // and resume it two seconds after pausing 
}, 7000);
 
setTimeout(function () {
    sound.stop(); // stop after ten seconds 
}, 10000);
 
// you can also listen for various callbacks: 
sound.on('complete', function() {
    console.log('Done with recording!');

    var SoundP = require('aplay');

    // fire and forget:
    new SoundP().play('/data/recording.wav');

});


// speaker test
// var say = require('say');
// say.speak('Say hello to my little friend');

/* web server */
const http = require('http')
const express = require('express')

let app = express()
app.get('/', function (req, res) { 

  return res.json({
    hello: 'world!'
  })

})

app.get('/photo.jpg', function (req, res) { 

   var captureOnce = function(err, timestamp, filename){ 

    // draw the image to the screen? 
    console.log('captured', filename)

    if (filename == 'blah.jpg')  {

      fs.readFile('/data/blah.jpg', function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.end(data); // Send the file data to the browser.
        camera.removeListener('read', captureOnce)
      });

    }

  }

  //listen for the "read" event triggered when each new photo/video is saved
  camera.on("read", captureOnce);

  //to take a snapshot, start a timelapse or video recording
  camera.start();

})

let server = http.createServer(app)
server.listen(80)

/* graphical clock */

var pitft = require("pitft");

var fb = pitft("/dev/fb1", true); // Returns a framebuffer in double buffering mode

// Clear the back buffer
fb.clear();

var xMax = fb.size().width;
var yMax = fb.size().height;

var radius = yMax / 2 - 10;
var imageFilePath = __dirname + "/raspberry-pi-icon.png";
var RA = 180 / Math.PI;

var drawDial = function() {
  fb.color(1, 1, 1);
  fb.circle(xMax / 2, yMax / 2, radius);

  fb.color(0, 0, 0);
  for (var a = 0; a < 360; a += 6) {
    var x0, y0;

    var x0 = xMax / 2 + Math.sin(a / RA) * (radius * 0.95);
    var y0 = yMax / 2 + Math.cos(a / RA) * (radius * 0.95);

    if (a % 30 == 0) {
      x1 = xMax / 2 + Math.sin(a / RA) * (radius * 0.85);
      y1 = yMax / 2 + Math.cos(a / RA) * (radius * 0.85);
      fb.line(x0, y0, x1, y1, radius * 0.05);
    } else {
      x1 = xMax / 2 + Math.sin(a / RA) * (radius * 0.90);
      y1 = yMax / 2 + Math.cos(a / RA) * (radius * 0.90);
      fb.line(x0, y0, x1, y1, radius * 0.01);
    }
  }
}

var hand = function(_fb, x, y, angle, length, width) {
  var x0 = xMax / 2 + Math.sin(angle / RA);
  var y0 = yMax / 2 - Math.cos(angle / RA);

  var x1 = xMax / 2 + Math.sin(angle / RA) * length;
  var y1 = yMax / 2 - Math.cos(angle / RA) * length;

  fb.line(x0, y0, x1, y1, width);
}

var update = function() {
  var now = new Date(),
    midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0),
    hours = (now.getTime() - midnight.getTime()) / 1000 / 60 / 60,
    minutes = (hours * 60) % 60;
  seconds = parseInt((minutes * 60) % 60);

  fb.color(1, 1, 1);
  fb.circle(xMax / 2, yMax / 2, radius * 0.85);
  fb.image(xMax / 2 - 16, yMax / 2 + radius * 0.50 - 16, imageFilePath);
  fb.color(1, 0, 0);
  hand(fb, 0, 0, hours / 12 * 360, radius * 0.6, radius * 0.05);
  hand(fb, 0, 0, minutes / 60 * 360, radius * 0.8, radius * 0.05);
  fb.color(0, 0, 0);
  hand(fb, 0, 0, seconds / 60 * 360, radius * 0.8, radius * 0.015);
  fb.color(1, 0, 0);
  fb.circle(xMax / 2, yMax / 2, radius * 0.075);
  fb.color(0, 0, 0);
  fb.font("fantasy", 14); // Use the "fantasy" font with size 12
  fb.text(xMax / 2 - 60, yMax / 2 - 32, now.toDateString(),
    false, 0); // Draw the text non-centered, rotated _a_ degrees
  fb.blit(); // Transfer the back buffer to the screen buffer
};

drawDial();
setInterval(function() {
  update();
}, 100);