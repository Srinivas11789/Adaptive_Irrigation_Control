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
var awsClientCert = "farm-hack.cert.pem.crt";
var awsClientPrivateKey = "farm-hack.private.key";
var awsClientId = "farm-hack";
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

device.subscribe('sensor_topic');

// Initialize the hardware for whichever kit we are using
var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
    var moisture = new five.Sensor("A1");
  var temp = new five.Temperature({
    pin: "A0",
    controller: "GROVE"
  });
    
    this.loop(2000, function() {
    console.log("%d°C", Math.round(temp.celsius));
  });
    
    moisture.scale(0, 100).on("change", function() {
    // 0 - Dry 
    // 50 - Wet
    if (this.value < 20) {
      console.log("dry");
    } else {
      console.log("its ok");
    }
  });
    
    device.publish('temperature', JSON.stringify({
            tempVal: temp
          }));
    
    device.publish('moisture', JSON.stringify({
            moistureVal: moisture
          }));
    
});


