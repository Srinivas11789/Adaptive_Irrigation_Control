/*
* Copyright (c) 2015 - 2016 Intel Corporation.
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

// The program is using the Node.js built-in `fs` module
// to load the config.json and any other files needed
var fs = require("fs");
var awsIoT = require('aws-iot-device-sdk');

// The program is using the Node.js built-in `path` module to find
// the file path to needed files on disk
var path = require("path");

// Load configuration data from `config.json` file. Edit this file
// to change to correct values for your configuration

var mqttPort = 8883;
var certPath = '/home/root/';
var awsRootCACert = "root-CA.crt";
var awsClientCert = "farm_hack.cert.pem.crt";
var awsClientPrivateKey = "farm_hack.private.key";
var awsClientId = "farm_hack";
var topicName = "sensor_topic";

var privateKeyPath = certPath + awsClientPrivateKey;
var clientCertPath = certPath + awsClientCert;
var rootCAPath = certPath + awsRootCACert;

var device = awsIoT.device({
    keyPath: privateKeyPath,
    certPath: clientCertPath,
    caPath: rootCAPath,
    clientId: awsClientId,
    region: "us-east-1"
});

console.log("AWS IoT Device object initialized");



// Initialize the hardware for whichever kit we are using
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

var grove_motion = require('jsupm_biss0001');
 // Instantiate a Grove Motion sensor on GPIO pin D2
 var myMotionObj = new grove_motion.BISS0001(2);

board.on("ready", function() {
    
    var moisture = new five.Sensor("A1");
    var moistureCond = "";
    
    moisture.scale(0, 100).on("change", function() {
        // 0 - Dry
        // 50 - Wet
        if (this.value < 20) {
          moistureCond = "dry";
        } else {
          moistureCond = "wet";
        }
    });
    
    var multi = new five.Multi({
        controller: "TH02"
    });

    device.subscribe('sensor_topic');

    this.loop(2000, function() {
    
        console.log("motion val: "+myMotionObj.value());
        console.log("Thermometer"); 
        console.log("  celsius           : ", multi.thermometer.celsius);
        console.log("  fahrenheit        : ", multi.thermometer.fahrenheit);
        console.log("  kelvin            : ", multi.thermometer.kelvin);
        console.log("--------------------------------------");

        console.log("Hygrometer");
        console.log("  relative humidity : ", multi.hygrometer.relativeHumidity);

        console.log("--------------------------------------");
        
        console.log("being published");
        
        device.publish('sensor_topic', JSON.stringify({
            message: "Values recorded",
            SerialNumber: awsClientId+"#"+new Date(),
            clientID: awsClientId,
            temperature: multi.thermometer.celsius,
            humidity: multi.hygrometer.relativeHumidity,
            moisture: moistureCond,
            motion: myMotionObj.value(),
            timestamp: new Date()
        }));
  });
  
    
   
    
    
    
    
});


