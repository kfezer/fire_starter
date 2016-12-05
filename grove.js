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

var exports = module.exports = {};

var mraa = require('mraa');

var motorLib = require('jsupm_uln200xa')

//chords for the buzzer
    var upmBuzzer = require("jsupm_buzzer");
    var chords = [];
    chords.push(upmBuzzer.FA);
    chords.push(upmBuzzer.LA);
    chords.push(upmBuzzer.DO);
    chords.push(upmBuzzer.FA);
    chords.push(upmBuzzer.LA);
    chords.push(upmBuzzer.SI);

    var chordIndex = 0;

// devices
var temp, light, buzzer, motor, screen;

// pins
var tempPin = 0,
    lightPin = 1,
    buzzerPin = 5,
    i2cBus = 6,
    voltageAdjust = 1.0;

// Initialize the Grove hardware devices
exports.init = function(config) {
  if (config.platform == "firmata") {
    // open connection to firmata
    mraa.addSubplatform(mraa.GENERIC_FIRMATA, "/dev/ttyACM0");

    tempPin += 512;
    lightPin += 512;
    buzzerPin += 512;
    i2cBus = 512;
    voltageAdjust = 0.66;
  }

  temp = new (require("jsupm_grove").GroveTemp)(tempPin),
  light = new (require("jsupm_grove").GroveLight)(lightPin),      
  buzzer = new (require("jsupm_buzzer").Buzzer)(buzzerPin),
  motor = new(require('jsupm_uln200xa').ULN200XA)(4096, 8, 9, 10, 11);
  screen = new (require("jsupm_i2clcd").Jhd1313m1)(i2cBus, 0x3E, 0x62);
  
}


//motor functions

exports.goForward = function()
{
    motor.setSpeed(5); // 5 RPMs
    motor.setDirection(motorLib.ULN200XA.DIR_CW);
    console.log("Rotating 1 revolution clockwise.");
    motor.stepperSteps(4096);
}

exports.reverseDirection = function()
{
	console.log("Rotating 1/2 revolution counter clockwise.");
	motor.setDirection(motorLib.ULN200XA.DIR_CCW);
	motor.stepperSteps(2048);
}

exports.closeDamper = function()
{
    console.log("Closing Damper");
    motor.setSpeed(5);
    motor.setDirection(motorLib.ULN200XA.DIR_CW);
    motor.stepperSteps(1024);
}

exports.openDamper = function()
{
    console.log("Opening Damper");
    motor.setSpeed(5);
    motor.setDirection(motorLib.ULN200XA.DIR_CW);
    motor.stepperSteps(1024);
}

exports.stop = function()
{
	motor.release();
}

exports.quit = function()
{
	motor = null;
	motor.cleanUp();
}

exports.motorCheck = function(){
    console.log("Rotating 1/2 revolution counter clockwise.");
    motor.setSpeed(5);
    motor.setDirection(motorLib.ULN200XA.DIR_CCW);
    motor.stepperSteps(2048);
    motor.setSpeed(5); // 5 RPMs
    motor.setDirection(motorLib.ULN200XA.DIR_CW);
    console.log("Rotating 1/2 revolution clockwise.");
    motor.stepperSteps(2096);
    motor.release();
    
}




// Colors used for the RGB LED
var colors = { red: [255, 0, 0], white: [255, 255, 255] };

// Sets the background color on the RGB LED
exports.color = function(string) {
  screen.setColor.apply(screen, colors[string] || colors.white);
}

// Displays a message on the RGB LED
exports.message = function(string, line) {
  // pad string to avoid display issues
  while (string.length < 16) { string += " "; }

  screen.setCursor(line || 0, 0);
  screen.write(string);
}

//bootup Sounds
exports.bootSounds = function(){
    buzzer.setVolume(0.3);
    for(var i = 0; i < 10; i ++){
        if (chords.length != 0)
        {
        //Play sound for one second
        console.log( buzzer.playSound(chords[chordIndex], 400000) );
        chordIndex++;
        //Reset the sound to start from the beginning. 
        if (chordIndex > chords.length - 1)
			chordIndex = 0;
        }
    }
    buzzer.stopSound();
    buzzer.stopSound();
}

// Sound an audible alarm when it is time to get up
//default is .5
exports.buzz = function() {
  buzzer.setVolume(0.5);
  buzzer.playSound(2600, 0);
}

// Turn off the audible alarm
exports.stopBuzzing = function() {
  buzzer.stopSound();
  buzzer.stopSound(); // if called only once, buzzer doesn't completely stop
}

// Reset the alarm
exports.reset = function() {
  this.color("white");
  this.message("", 1);
  this.stopBuzzing();
}

exports.getTemperature = function() {
  return temp.value() * voltageAdjust;
}

exports.getLight = function(){
    return light.value() * voltageAdjust;
}