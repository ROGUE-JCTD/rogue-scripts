"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var TestModule = (function() {

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

    // when true, in addition to moving the camera
    createFeature: false,

    // when createFeature is true, createFeatureConcurrentCount number of features will be created at once.
    // default is 1 causing only 1 feature creation per timer trigger
    createFeatureConcurrentCount: 1,

    // name of the layer to to which features will be added
    layerName: 'canchas_de_futbol', //'incidentes_copeco',

    workspaceName: 'geonode',

    // name of the column to which a log msg will be written to when a feature is placed
    attributeName: 'comentarios',

    // this string gets prepended to the date and run count and features' attributeName value will be set to the result
    attributeValuePrefix: 'TestModule',

    // if teh geometry attribute type is not geom, it can be set here. for example, 'the_geom'
    geomAttributeName: 'geom'
  };

  var mapService = angular.element('html').injector().get('mapService');
  var httpService = angular.element('html').injector().get('$http');
  var timeout = null;
  var projection4326 = 'EPSG:4326';
  var projectionMap = mapService.map.getView().getView2D().getProjection().getCode();
  var runCounter = 0;
  var dateLastRun = null;
  var featureList = [];

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

  function run() {
    runCounter += 1;
    dateLastRun = new Date();

    var view = getRandomView();
    var pan = ol.animation.pan({source: mapService.map.getView().getView2D().getCenter()});
    var zoom = ol.animation.zoom({resolution: mapService.map.getView().getView2D().getResolution()});
    mapService.map.beforeRender(pan, zoom);
    mapService.map.getView().getView2D().setCenter(view.center);
    mapService.map.getView().getView2D().setZoom(view.zoom);

    var concurrentCompletedCount = 0;

    var successFunc = function() {
      concurrentCompletedCount += 1;
      // once the number of completed concurrent runs complete, set timer
      if (concurrentCompletedCount >= config.createFeatureConcurrentCount) {
        setTimer();
      }
    };
    var i;
    if (config.createFeature) {
      for (i = 0; i < config.createFeatureConcurrentCount; i += 1) {
        // if we are creating features, only set timer after previous create completes
        createFeature(view.center[0], view.center[1], successFunc);
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

  function getInsertWfsData(lon, lat, date) {
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
        '<feature:' + config.attributeName + '>' + config.attributeValuePrefix + ' runCounter: ' +
        runCounter + ' ' + date + '</feature:' + config.attributeName + '>' +
        '</feature:' + config.layerName + '>' +
        '</wfs:Insert>' +
        '</wfs:Transaction>';
  }

  function getRemoveWfsData() {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Delete xmlns:feature="http://www.geonode.org/" typeName="' +
        config.workspaceName + ':' + config.layerName + '">' +
        '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' +
        '<ogc:FeatureId fid="' + getRandomFeature(true).fid + '"/>' +
        '</ogc:Filter>' +
        '</wfs:Delete>' +
        '</wfs:Transaction>';
  }

  function getUpdateWfsData(feature) {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Update xmlns:feature="http://www.geonode.org/" typeName="' +
        config.workspaceName + ':' + config.layerName + '">' +
        '<wfs:Property>' +
        '<wfs:Name>' + config.geomAttributeName +
        '</wfs:Name>' +
        '<wfs:Value>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="' + projectionMap + '">' +
        '<gml:pos>' + feature.geom.coords[0] + ' ' + feature.geom.coords[1] + '</gml:pos>' +
        '</gml:Point>' +
        '</wfs:Value>' +
        '</wfs:Property>' +
        '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' +
        '<ogc:FeatureId fid="' + feature.fid + '" />' +
        '</ogc:Filter>' +
        '</wfs:Update>' +
        '</wfs:Transaction>';
  }

  var forEachArrayish = function(arrayish, funct) {
    if (goog.isArray(arrayish)) {
      goog.array.forEach(arrayish, funct);
    } else {
      funct(arrayish);
    }
  };

  function getRandomFeature(remove) {
    var index = Math.floor(getRandomBetween(0, featureList.length));
    if (remove) {
      return featureList.splice(index, 1)[0];
    }
    return featureList[index];
  }

  function getAllFeatures() {
    var url = '/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=' + config.workspaceName + ':' +
        config.layerName;

    httpService.get(url).then(function(response) {
      var x2js = new X2JS();
      var json = x2js.xml_str2json(response.data);
      forEachArrayish(json.FeatureCollection.member, function(feature) {
        var srs = feature[config.layerName][config.geomAttributeName].Point._srsName.split(':');
        var coords = feature[config.layerName][config.geomAttributeName].Point.pos.__text.split(' ');
        featureList.push({
          'fid': feature[config.layerName]['_gml:id'],
          'geom': {
            'srsName': 'EPSG:' + srs[srs.length - 1],
            'coords': [parseFloat(coords[1]), parseFloat(coords[0])]
          }
        });
      });
      run();
    });
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
    httpService.post(url, getInsertWfsData(lon, lat, dateLastRun), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalInserted>1</wfs:totalInserted>') !== -1) {
              console.log('---- createFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                  ' post duration: ', (Date.now() - timeInMillies), ', response: ', data);
              var x2js = new X2JS();
              var json = x2js.xml_str2json(data);
              featureList.push({
                'fid': json.TransactionResponse.InsertResults.Feature.FeatureId._fid,
                'geom': {
                  'srsName': projectionMap,
                  'coords': [lon, lat]
                }
              });
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

  function removeFeature(callback_success, callback_error) {
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var timeInMillies = Date.now();

    var url = '/geoserver/wfs/WfsDispatcher';
    httpService.post(url, getRemoveWfsData(), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalDeleted>1</wfs:totalDeleted>') !== -1) {
              console.log('---- deletedFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
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

  function updateFeature(callback_success, callback_error) {
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var timeInMillies = Date.now();

    var url = '/geoserver/wfs/WfsDispatcher';
    var feature = getRandomFeature();
    var point = null;
    var transform;
    if (feature.geom.srsName !== projection4326) {
      point = new ol.geom.Point(feature.geom.coords);
      transform = ol.proj.getTransform(feature.geom.srsName, projection4326);
      point.transform(transform);
    }
    var randomLat = getRandomBetween(-1.0, 1.0);
    var randomLon = getRandomBetween(-1.0, 1.0);
    feature.geom.coords[0] += randomLon;
    feature.geom.coords[1] += randomLat;
    if (feature.geom.coords[0] > config.lonMax || feature.geom.coords[0] < config.lonMin ||
        feature.geom.coords[1] > config.latMax || feature.geom.coords[1] < config.latMin) {
      feature.geom.coords[0] -= randomLon;
      feature.geom.coords[1] -= randomLat;
      console.log('====[ Could not update feature, new position went out of bounds');
      return;
    }
    if (!goog.isDefAndNotNull(point)) {
      point = new ol.geom.Point(feature.geom.coords);
    }
    transform = ol.proj.getTransform(projection4326, projectionMap);
    point.transform(transform);

    httpService.post(url, getUpdateWfsData(feature), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalUpdated>1</wfs:totalUpdated>') !== -1) {
              console.log('---- updatedFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                  ' post duration: ', (Date.now() - timeInMillies), ', response: ', data);
              transform = ol.proj.getTransform(projectionMap, feature.geom.srsName);
              point.transform(transform);
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
    getAllFeatures();
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
