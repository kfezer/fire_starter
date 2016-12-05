"use strict";

const uuid = require('../index.js').uuid;
const Accessory = require('../index.js').Accessory;
const Service = require('../index.js').Service;
const Characteristic = require('../index.js').Characteristic;
const board = require('../grove.js');

const mraa = require('mraa');

var temp;



// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
let accessory = new Accessory('Firebox', uuid.generate('some-string'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
accessory.username = "33:44:55:66:77:88";
accessory.pincode = '000-00-001';

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`

let service = accessory.addService(Service.TemperatureSensor);
let characteristic = service.getCharacteristic(Characteristic.CurrentTemperature);


characteristic.on('get', function(callback) {
   
   // return our current value
   callback(null, board.getTemperature());
 });

setInterval(function() {
  service.setCharacteristic(Characteristic.CurrentTemperature, board.getTemperature());
  
}, 3000);


var isOpen = true;

//add the closeDamper function
let damperService = accessory.addService(Service.Switch);
let onCharacteristic = damperService.getCharacteristic(Characteristic.On);
onCharacteristic.on('set', (value, callback) => {
    isOpen = value;
    callback(null,board.closeDamper());
});
onCharacteristic.on('get', callback => {
    callback(null, isOpen);
});


module.exports.accessory = accessory;