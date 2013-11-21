var TestModuel = (function(map){

  var config = {
    latMin: -90,
    latMax: 90,
    lonMin: -180,
    lonMax: 180,
    zoomMin: 0,
    zoomMax: 14,
    createFeature: true
  };

  var interval = null;
  var projection4326 = new OpenLayers.Projection('EPSG:4326');
  var projection900913 = new OpenLayers.Projection('EPSG:900913');
  var runCounter = 0;

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
    var view = getRandomView();
    console.log('---- Test.run, counter: ', runCounter, ', view: ', view);
    map.setCenter(view.center, view.zoom);

    if (config.createFeature) {
      createFeature(view.center.lon, view.center.lat);
    }
  }

  function getWfsData(lon, lat) {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Insert>' +
        '<feature:incidentes_copeco xmlns:feature="http://www.geonode.org/">' +
        '<feature:geom>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:900913">' +
        '<gml:pos>' + lon + ' ' + lat + '</gml:pos>' +
        '</gml:Point>' +
        '</feature:geom>' +
        '<feature:comentarios> TestModuel.runCounter ' + runCounter + '</feature:comentarios>' +
        '</feature:incidentes_copeco>' +
        '</wfs:Insert>' +
        '</wfs:Transaction>';
  }

  function createFeature(lon, lat){
    var request = new OpenLayers.Request.POST({
      url: '/geoserver/wfs/WfsDispatcher',
      data: getWfsData(lon, lat),
      callback: function(response){
        console.log('---- wfst success');
      },
      failure: function(response){
        Arbiter.error('====[ Error: wfst failed. response: ', response);
      }
    });
  }


  var p = {};

  p.start = function(frequency) {
    if (interval) {
      p.stop();
    }

    if (typeof frequency == undefined || !frequency) {
      frequency = 3000;
    }

    console.log('====[ startTest. frequency: ', frequency);
    var context = this;
    interval = setInterval(run, frequency);
    // also run immediately
    run();
  };

  p.stop = function() {
    console.log('====[ stopTest');
    clearInterval(interval);
  };

  return p;
}(app.mapPanel.map));

TestModuel.start();

// just make map available for easier access
var map = app.mapPanel.map;
