"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var TestModuel = (function(map){

  var config = {
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
    zoomMin: 0,
    zoomMax: 14,
    createFeature: true,

    frequency: 3000,

    username: '',
    password: '',
    layerName: 'canchas_de_futbol', //'incidentes_copeco',
    attributeName: 'comentarios',
    attributeValue: 'TestModuel'
  };

  var interval = null;
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
      // if we are creating features, only set another timeout after last creation success
      createFeature(view.center.lon, view.center.lat, function() {
        interval = setTimeout(run, config.frequency);
      });
    } else {
      interval = setTimeout(run, config.frequency);
      console.log('---- move map @ ' + dateLastRun + '. runCounter: ' + runCounter + ', view: ', view);
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
        '<feature:geom>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:900913">' +
        '<gml:pos>' + lon + ' ' + lat + '</gml:pos>' +
        '</gml:Point>' +
        '</feature:geom>' +
        '<feature:' + config.attributeName + '>' + config.attributeValue + ' runCounter: ' + runCounter + ' ' + date + '</feature:' + config.attributeName + '>' +
        '</feature:' + config.layerName + '>' +
        '</wfs:Insert>' +
        '</wfs:Transaction>';
  }

  function createFeature(lon, lat, callback_success){

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

          if (response.responseText.indexOf("ExceptionReport") !== -1 ){
            console.log('====[ TestModuel. Wfs Transaction Exception Report: ', response.responseText);
            p.stop();
            alert('TestModuel. Wfs Transaction Exception Report. see console. missing username/password on an endpoint that requires authentication can cause this error.  verify username: ' + config.username + ', password: ' + config.password);
          } else {
            console.log('---- createFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter + ' post duration: ', (Date.now() - timeInMillies) , ', response: ', response);

            callback_success();
          }
        } else if (response.status === 401) {
          console.log('====[ Error: Wfs Transaction, Unauthorized: ', response);
          alert('TestModuel. Wfs Transaction, Unauthorized. verify username: ' + config.username + ', password: ' + config.password);
        } else {
          console.log('====[ Error: wfst response. response: ', response);
          alert('TestModuel. Wfs Transaction failed. ');
        }
      }
    });
  }


  var p = {};

  p.start = function(frequency) {
    if (interval) {
      p.stop();
    }

    if (typeof frequency !== 'undefined' && frequency) {
      config.frequency = frequency;
    }

    console.log('====[ startTest. frequency: ', config.frequency);
    run();
  };

  p.stop = function() {
    console.log('====[ stopTest');
    clearInterval(interval);
  };

  p.getConfig = function() {
    return config;
  };

  return p;
}(app.mapPanel.map));

TestModuel.start();
