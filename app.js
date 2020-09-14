


var XMLHttpRequest = require('xhr2');
var aqiCalc = require('./aqiCalc.js');

var lastAQI=[];
var request = new XMLHttpRequest();
var reply = new XMLHttpRequest();


var checkIn = function(sensorID){
  var data;
  var pm25value; 
  var label;
  var interiorID = sensorID;
  var AQI;
  var AQIDescription;

  request.open('GET', 'https://www.purpleair.com/json?show='+interiorID, true);
  request.setRequestHeader('Cache-Control', 'no-cache');
  request.onload = function () {
    data = JSON.parse(this.response);

    // exterior sensors have two channels, interior only one
    if (data.results[1].PM2_5Value){
      pm25value = ((parseInt(data.results[0].PM2_5Value) + (parseInt(data.results[1].PM2_5Value)))/2);
    } else {
      pm25value = parseInt(data.results[0].PM2_5Value)
    }

  // prepare message if needed
  AQI = aqiCalc.aqiFromPM(pm25value);
  AQIDescription = aqiCalc.getAQIDescription(AQI); 
  label = data.results[0].Label;

  // check to see if description has changed, or if it never existed
  if (AQIDescription !== lastAQI[interiorID] || !lastAQI[interiorID]){
    // send message to slack
    reply.open ('POST', 'https://hooks.slack.com/services/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', true);
    reply.send( JSON.stringify({
        "text": label + " Staus: " + AQIDescription + " "+AQI
    }));
    
    console.log(label + " Staus: " + AQIDescription+ " "+AQI);
  } else if (lastAQI[sensorID]){
    console.log(label +" same")
  }
  // store message to know if it changes
  lastAQI[interiorID] = AQIDescription;
  }

  request.send();
    setTimeout (function(){  
      checkIn(interiorID)}.bind(this), 5*60000);
    console.log(sensorID)

}

checkIn(62141);
setTimeout(function(){checkIn(53149)}, 6000);

