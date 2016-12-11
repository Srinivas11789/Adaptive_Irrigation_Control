/*
 * Copyright 2010-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//node.js deps

//npm deps

//app deps
//const deviceModule = require('..').device;
//const cmdLineProcess = require('./lib/cmdline');

//begin module
var awsIoT = require('aws-iot-device-sdk');
// AWS IoT Variables
var mqttPort = 8883;
var rootPath = '/home/root/test/awscerts/';
var awsRootCACert = "root-ca.pem";
var awsClientCert = "aws-certificate.pem.crt";
var awsClientPrivateKey = "aws-private.pem.key";
var topicName = "testtopic";
var awsClientId = "TaraTest";
var awsIoTHostAddr = "https://aaylyufambxv.iot.us-east-1.amazonaws.com";

var privateKeyPath = rootPath + awsClientPrivateKey;
var clientCertPath = rootPath + awsClientCert;
var rootCAPath = rootPath + awsRootCACert;

var device = awsIoT.device({
    keyPath: privateKeyPath,
    certPath: clientCertPath,
    caPath: rootCAPath,
    clientId: awsClientId,
    region: "us-east-1"
});

console.log("AWS IoT Device object initialized");

device
  .on('connect', function () {
      console.log('connecting to AWS IoT');
      device.subscribe('topic_1');
      device.publish('topic_1', JSON.stringify({ test_data: 1 }));
  });

device
  .on('message', function (topic, payload) {
      console.log('message', topic, payload.toString());
  });


