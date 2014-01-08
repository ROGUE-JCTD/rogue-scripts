"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var TestModule = (function(){

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
    frequency: 2000,

    // if set and greater than zero, run will only run these many times and then automatically stop
    runCounterMax: 0,

    // username and password to connect to geoserver when making a Wfs Transaction
    username: 'admin',
    password: 'admin',

    // createFeatureConcurrentCount number of features will be created in a loop. This will help test concurrency issues.
    // default is 1 causing only 1 feature creation per timer trigger
    createFeatureConcurrentCount: 1,

    // name of the layer to to which features will be added
    layerName: 'incidentes_copeco', //'canchas_de_futbol',

    // attributes and values to set them to when creating a feature
    attributes: {
      evento: 'otro', // nino_perdido, accidente_ambulancia, incidente_de_trafico, danos_y_perjuicios, otro
      comentarios: 'yoyo' //'eval("TestModule" + " runCounter: " + runCounter + " date: " + date)'
    },

    // if teh geometry attribute type is not geom, it can be set here. for example, 'the_geom'
    geomAttributeName: 'geom',

    // list of available operations and a corresponding weight. The higher the weight relative to the other available
    // operations, the more often it will tend to get selected.
    operations: {
      createFeature: 50,
      removeFeature: 0,
      modifyFeature: 0,
      moveView: 10
    }
  };

  var mapService = angular.element('html').injector().get('mapService');
  var httpService = angular.element('html').injector().get('$http');
  var timeout = null;
  var projection4326 = 'EPSG:4326';
  var projectionMap = mapService.map.getView().getView2D().getProjection().getCode();
  var runCounter = 0;
  var dateLastRun = null;
  var concurrentCompletedCount = 0;

  function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getRandomView() {
    var lat = getRandomBetween(config.latMin, config.latMax);
    var lon = getRandomBetween(config.lonMin, config.lonMax);
    var zoom = Math.floor(getRandomBetween(config.zoomMin, config.zoomMax));
    var point = new ol.geom.Point([lon, lat]);
    var transform = ol.proj.getTransform(projection4326, projectionMap);
    point.transform(transform);

    return {
      center: point.getCoordinates(),
      zoom: zoom
    };
  }

  function getRandomfeature() {
    //TODO: select a random feature from all available features in the specified layer
  }

  function getViewFromFeature(feature) {
    //TODO: given a feature, return a view object with structure similar to what getRandomView returns
  }

  // randomly select an operation based on the user specified weights of the operations
  function selectOperation() {
    var pointSum = 0;

    for (var op in config.operations) {
      pointSum += config.operations[op];
    }

    var position = Math.random() * pointSum;

    var currentSum = 0;

    for (op in config.operations) {
      currentSum += config.operations[op];

      if (position < currentSum) {
        return op;
      }
    }

    alert ('error: selectOperation failed! should never hit this');
  }

  function run() {
    runCounter += 1;
    dateLastRun = new Date();

    var op = selectOperation();

    // call the selected operation's run function
    var operationFunctionName = 'run_' + op;
    console.log('-- operation: ' + operationFunctionName);
    eval(operationFunctionName + '()');
  }

  function run_moveView() {
    var view = getRandomView();
    moveToView(view);
    console.log('---- moveView @ ' + dateLastRun + '. runCounter: ' + runCounter + ', view: ', view);

    // we can immediately set the timer again since this operation does not take any time to execute
    setTimer();
  }

  function run_createFeature() {
    var view = getRandomView();
    moveToView(view);

    for (var i = 0; i < config.createFeatureConcurrentCount; i += 1) {
      createFeature(view.center[0], view.center[1], setTimerAfterConcurrentsComplete);
    }
  }

  function run_removeFeature() {
    for (var i = 0; i < config.createFeatureConcurrentCount; i += 1) {
      var feature = getRandomfeature();
      var view = getViewFromFeature(feature);

      // only move to the location of the first feature we are trying to remove
      if (i === 0) {
        moveToView(view);
      }

      removeFeature(feature, setTimerAfterConcurrentsComplete);
    }
  }

  function run_modifyFeature() {
    for (var i = 0; i < config.createFeatureConcurrentCount; i += 1) {
      var feature = getRandomfeature();
      var view = getViewFromFeature(feature);

      // only move to the location of the first feature we are trying to remove
      if (i === 0) {
        moveToView(view);
      }

      modifyFeature(feature, setTimerAfterConcurrentsComplete);
    }
  }

  function setTimerAfterConcurrentsComplete() {
    concurrentCompletedCount += 1;
    // once the number of completed concurrent runs complete, set timer
    if (concurrentCompletedCount >= config.createFeatureConcurrentCount) {
      concurrentCompletedCount = 0;
      setTimer();
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

  function moveToView(view){
    var pan = ol.animation.pan({source: mapService.map.getView().getView2D().getCenter()});
    var zoom = ol.animation.zoom({resolution: mapService.map.getView().getView2D().getResolution()});
    mapService.map.beforeRender(pan, zoom);
    mapService.map.getView().getView2D().setCenter(view.center);
    mapService.map.getView().getView2D().setZoom(view.zoom);
  }

  function getWfsData(lon, lat, date) {
    var attributesXML = '';

    for(var attribute in config.attributes) {
      var value = config.attributes[attribute];
      // if the attribute value starts with 'eval(' evaluate the string. lat, lon, date, will resolve so will any thing
      // else visible to the scope
      //TODO: test eval support
      if (value.indexOf('eval(') === 0) {
        value = value.replace(/"/g, '\\"');
        value = eval(value);
      }
      attributesXML += '<feature:' + attribute + '>' + value + '</feature:' + attribute + '>';
    }

    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Insert>' +
        '<feature:' + config.layerName + ' xmlns:feature="http://www.geonode.org/">' +
        '<feature:' + config.geomAttributeName + '>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="' + projectionMap + '">' +
        '<gml:pos>' + lon + ' ' + lat + '</gml:pos>' +
        '</gml:Point>' +
        '</feature:' + config.geomAttributeName + '>' +
        attributesXML +
        '</feature:' + config.layerName + '>' +
        '</wfs:Insert>' +
        '</wfs:Transaction>';
  }

  function removeFeature(feature, callback_success, callback_error) {
    //TODO: remove the specified feature. MUST call callback_success when operation completes successfully
  }

  function modifyFeature(feature, callback_success, callback_error) {
    //TODO: remove the specified feature. MUST call callback_success when operation completes successfully
  }

  function createFeature(lon, lat, callback_success, callback_error) {
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var timeInMillies = Date.now();

    var url = '/geoserver/wfs/WfsDispatcher';
    httpService.post(url, getWfsData(lon, lat, dateLastRun), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalInserted>1</wfs:totalInserted>') !== -1) {
              console.log('---- createFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                  ' post duration: ', (Date.now() - timeInMillies), ', response: ', data);

              if (callback_success) {
                callback_success();
              }
            } else if (data.indexOf('ExceptionReport') !== -1) {
              console.log('====[ TestModule. Wfs Transaction Exception occured: ', data);
              p.stop();
              var begin = data.indexOf('<ows:ExceptionText>');
              var end = data.indexOf('</ows:ExceptionText>');
              var exceptionText = '';
              if (begin !== -1 && end !== -1) {
                exceptionText = data.substring(begin + '<ows:ExceptionText>'.length, end);
              }
              alert('Wfs-T Exception! See console for response. ExceptionText: ' + exceptionText);
              if (callback_error) {
                callback_error();
              }
            } else {
              console.log('====[ TestModule. Unknown Status or Error #1: ', data);
              p.stop();
              alert('Wfs-T Unknown Status or Error. See console for response.');
              if (callback_error) {
                callback_error();
              }
            }
          } else if (status === 401) {
            console.log('====[ Error: Wfs Transaction, Unauthorized: ', data);
            alert('TestModule. Wfs-T, unauthorized. Verify username: ' + config.username +
                ', password: ' + config.password);
            if (callback_error) {
              callback_error();
            }
          } else {
            console.log('====[ TestModule. Unknown Status or Error #2: ', data);
            p.stop();
            alert('Wfs-T Unknown Status or Error. See console for response.');
            if (callback_error) {
              callback_error();
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
}());

TestModule.start();
