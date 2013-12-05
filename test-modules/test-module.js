"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var TestModule = (function(map){

  var config = {

    // which part of the map to select a random point from
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,

    // how far to zoom in / out
    zoomMin: 0,
    zoomMax: 14,

    // how often to run in milliseconds
    frequency: 10000,

    // if set and greater than zero, run will only run these many times and then automatically stop
    runCounterMax: 0,

    // username and password to connect to geoserver when making a Wfs Transaction
    username: 'admin',
    password: 'geoserver',

    // when true, in addition to moving the camera
    createFeature: true,

    // when createFeature is true, createFeatureConcurrentCount number of features will be created at once.
    // default is 1 causing only 1 feature creation per timer trigger
    createFeatureConcurrentCount: 5,

    // name of the layer to to which features will be added
    layerName: 'canchas_de_futbol', //'incidentes_copeco',

    // name of the column to which a log msg will be written to when a feature is placed
    attributeName: 'comentarios',

    // this string gets prepended to the date and run count and features' attributeName value will be set to the result
    attributeValuePrefix: 'TestModule',

    // if teh geometry attribute type is not geom, it can be set here. for example, 'the_geom'
    geomAttributeName: 'geom'
  };

  var timeout = null;
  var projection4326 = new OpenLayers.Projection('EPSG:4326');
  var projection900913 = new OpenLayers.Projection('EPSG:900913');
  var runCounter = 0;
  var dateLastRun = null;

  function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRandomView() {
    var lat = getRandomBetween(config.latMin, config.latMax);
    var lon = getRandomBetween(config.lonMin, config.lonMax);
    var zoom = Math.floor(getRandomBetween(config.zoomMin, config.zoomMax));
    var point = new OpenLayers.Geometry.Point(lon, lat);
    point.transform(projection4326, projection900913);
    var center = new OpenLayers.LonLat(point.x, point.y);

    return {
      center: center,
      zoom: zoom
    };
  }

  function run() {
    runCounter += 1;
    dateLastRun = new Date();

    var view = getRandomView();
    map.setCenter(view.center, view.zoom);

    if (config.createFeature) {
      var concurrentCompletedCount = 0;

      for (var i=0; i < config.createFeatureConcurrentCount; i += 1) {
        // if we are creating features, only set timer after previous create completes
        createFeature(view.center.lon, view.center.lat, function() {
          concurrentCompletedCount += 1;
          // once the number of completed concurrent runs complete, set timer
          if (concurrentCompletedCount >= config.createFeatureConcurrentCount) {
            setTimer();
          }
        });
      }
    } else {
      // when in only move map mode, set timer again.
      setTimer();
      console.log('---- move map @ ' + dateLastRun + '. runCounter: ' + runCounter + ', view: ', view);
    }
  }

  function setTimer() {
    if (typeof config.runCounterMax !== 'undefined' && (!config.runCounterMax || runCounter < config.runCounterMax)) {
      timeout = setTimeout(run, config.frequency);
    } else {
      console.log('----[ stopping TestModule because runCounter reached runCounterMax. runCounter: ' + runCounter);
      alert(' TestModule stopped as requested by runCounterMax. number of times ran: ' + runCounter);
      p.stop();
    }
  }

  function getWfsData(lon, lat, date) {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Insert>' +
        '<feature:' + config.layerName + ' xmlns:feature="http://www.geonode.org/">' +
        '<feature:' + config.geomAttributeName + '>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:900913">' +
        '<gml:pos>' + lon + ' ' + lat + '</gml:pos>' +
        '</gml:Point>' +
        '</feature:' + config.geomAttributeName + '>' +
        '<feature:' + config.attributeName + '>' + config.attributeValuePrefix + ' runCounter: ' + runCounter + ' ' + date + '</feature:' + config.attributeName + '>' +
        '</feature:' + config.layerName + '>' +
        '</wfs:Insert>' +
        '</wfs:Transaction>';
  }

  function createFeature(lon, lat, callback_success, callback_error){

    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      }
    }

    var dateStart = new Date();
    var timeInMillies = Date.now();

    var request = new OpenLayers.Request.POST({
      url: '/geoserver/wfs/WfsDispatcher',
      data: getWfsData(lon, lat, dateLastRun),
      headers: config.headerData,
      callback: function(response){

        if (response.status === 200) {

          // if a feature was inserted, post succeeded
          if (response.responseText.indexOf("<wfs:totalInserted>1</wfs:totalInserted>") !== -1) {
            console.log('---- createFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                ' post duration: ', (Date.now() - timeInMillies) , ', response: ', response);

            if (callback_success) {
              callback_success();
            }
          } else if (response.responseText.indexOf("ExceptionReport") !== -1 ){
            console.log('====[ TestModule. Wfs Transaction Exception occured: ', response.responseText);
            p.stop();
            var begin = response.responseText.indexOf('<ows:ExceptionText>');
            var end = response.responseText.indexOf('</ows:ExceptionText>');
            var exceptionText = '';
            if (begin !== -1 && end !== -1) {
              exceptionText = response.responseText.substring(begin + '<ows:ExceptionText>'.length, end);
            }
            alert('Wfs-T Exception! See console for response. ExceptionText: ' + exceptionText);
            if (callback_error) {
              callback_error();
            }
          } else {
            console.log('====[ TestModule. Unknown Status or Error #1: ', response.responseText);
            p.stop();
            alert('Wfs-T Unknown Status or Error. See console for response.');
            if (callback_error) {
              callback_error();
            }
          }
        } else if (response.status === 401) {
          console.log('====[ Error: Wfs Transaction, Unauthorized: ', response);
          alert('TestModule. Wfs-T, unauthorized. Verify username: ' + config.username + ', password: ' + config.password);
          if (callback_error) {
            callback_error();
          }
        } else {
          console.log('====[ TestModule. Unknown Status or Error #2: ', response.responseText);
          p.stop();
          alert('Wfs-T Unknown Status or Error. See console for response.');
          if (callback_error) {
            callback_error();
          }
        }
      }
    });
  }


  var p = {};

  p.start = function(frequency) {
    if (timeout) {
      p.stop();
    }

    if (typeof frequency !== 'undefined' && frequency) {
      config.frequency = frequency;
    }

    console.log('====[ startTest. frequency: ', config.frequency, ', config: ', config);
    run();
  };

  p.stop = function() {
    console.log('====[ stopTest');
    clearTimeout(timeout);
  };

  p.getConfig = function() {
    return config;
  };

  return p;
}(app.mapPanel.map));

TestModule.start();
