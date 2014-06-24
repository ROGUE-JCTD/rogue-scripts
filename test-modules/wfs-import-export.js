"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var WfsModule = (function() {

  var config = {
    // username and password to connect to geoserver when making a Wfs Transaction
    username: 'syrusm',
    password: '',

    sourceLayerName: 'geonode:MuestreodeViviendas',
    destinationLayerName: 'geonode:SyrusMuestreodeViviendas', //'muestreo_viviendas',

    destinationSrs: 'EPSG:4326',

    // destination: source
    attributesMap: {
      Fecha_de_levantamiento: 'fecha_hora',
      Nombre_quien_levanto: 'Levanto',
      Codigo: 'Codigo',
      Departamento: 'departamen',
      Municipio: 'Municipio',
      Ciudad: 'Ciudad',
      Barrio_o_Colonia: 'Barrio_Col',
      Aldea_o_Cacerio: 'aldea_cace',
      Direccion_exacta: 'Sector, numero_cas, Calle',
      Fecha_inicio_del_proyecto: 'Fecha_inic',
      Fecha_terminacion_del_proyecto: 'Fecha_fina',
      Nombre_del_beneficiario: 'Beneficiar',
      Numero_de_identidad: 'Identidad',
      Estado_civil: 'Est_civil',
      Nombre_del_conyugue: 'Conyugue',
      Numero_de_hijos: 'No__Hijos',
      Numero_de_telefono: 'Telefono',
      Actividad_laboral_del_beneficiario: 'ac_laboral',
      Documento_de_propiedad: 'doc_terren',
      Sobrecimiento: 'Sobrecimie',
      Solera_inferior: 'Solera',
      Cargadores: 'Cargadores',
      Paredes_de_bloque: 'Pared',
      Puertas: 'Puertas',
      Ventanas: 'Ventanas_u',
      Solera_superior: 'Solera',
      Techo_de_aluzinc: 'Techo',
      Sistema_electrico: 'Ins_electr',
      Observaciones: 'observacio',
      fotos: ''
      //geom: ''
    }
  };

  var mapService = angular.element('html').injector().get('mapService');
  var httpService = angular.element('html').injector().get('$http');
  var featureList = [];
  var attributesStatus = {};

  function getAllFeatures(callback_success, callback_error) {
    console.log('---- getAllFeatures');
    var url = '/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&srsName=' + config.destinationSrs +
        '&outputFormat=JSON&typeNames=' + config.sourceLayerName;

    httpService.get(url).then(function(response) {
      console.log('====>> response: ', response);
      if (response.data.features.length > 0) {
        for (var key in response.data.features) {
          console.log('---- feature: ', response.data.features[key]);
        }

        featureList = response.data.features;
        if (callback_success) {
          callback_success(featureList);
        }
      } else {
        if (callback_error) {
          callback_error();
        }
      }
    });
  }

  function postAllFeatures(callback_success, callback_error) {
    console.log('---- postAllFeatures: ', getInsertWfsData());
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var xmlData = getInsertWfsData();
    console.log('=================== xmlData: ', xmlData);

    var url = '/geoserver/wfs/WfsDispatcher';
    httpService.post(url, xmlData, {headers: config.headerData})
        .success(function(data, status, headers, config) {
          console.log('---- data: ', data);
          console.log('---- status: ', status);

          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:Status> <wfs:SUCCESS/> </wfs:Status>') !== -1) {
              console.log('---- success');
              if (callback_success) {
                callback_success();
              }
            } else if (data.indexOf('ExceptionReport') !== -1) {
              console.log('====[ TestModule. Wfs Transaction Exception occured: ', data, status, headers, config);
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
              console.log('====[ TestModule. Unknown Status or Error #1: ', data, status, headers, config);
              alert('Wfs-T Unknown Status or Error. See console for response.');
              if (callback_error) {
                callback_error();
              }
            }
          } else if (status === 401) {
            console.log('====[ Error: Wfs Transaction, Unauthorized: ', data, status, headers, config);
            alert('TestModule. Wfs-T, unauthorized. Verify username: ' + config.username +
                ', password: ' + config.password);
            if (callback_error) {
              callback_error();
            }
          } else {
            console.log('====[ TestModule. Unknown Status or Error #2: ', data, status, headers, config);
            alert('Wfs-T Unknown Status or Error. See console for response.');
            if (callback_error) {
              callback_error();
            }
          }
        });

  }

  function getInsertWfsFeaturesXml() {
    var xml = '';
    console.log('==== featureList: ', featureList);
    for (var index in featureList) {
      var feature = featureList[index];
      var attributesXML = '';
      //NOTE: might be .properties
      console.log('---- feature: ', feature);
      for (var property in feature.properties) {
        var value = feature.properties[property];
        if (goog.isDefAndNotNull(value)) {
          if (goog.isDefAndNotNull(config.attributesMap) && goog.isDefAndNotNull(config.attributesMap[property])) {
            property = config.attributesMap[property];
            if (!goog.isDefAndNotNull(attributesStatus.property)) {
              attributesStatus.property = 0;
            }
            attributesStatus.property += 1;
          }
          attributesXML += '<feature:' + property + '>' + value + '</feature:' + property + '>';
        }
      }
      console.log('---- feature, attributesXML: ', attributesXML);
      xml += '' +
          '<feature:' + config.destinationLayerName + ' xmlns:feature="http://www.geonode.org/">' +
            '<feature:' + feature.geometry_name + '>' +
              '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="' + config.destinationSrs + '">' +
                '<gml:coordinates decimal="." cs="," ts=" ">' + feature.geometry.coordinates[0] + ',' + feature.geometry.coordinates[1] + '</gml:coordinates>' +
              '</gml:Point>' +
            '</feature:' + feature.geometry_name + '>' +
            attributesXML +
          '</feature:' + config.destinationLayerName + '>';
    }
    return xml;
  }

  function getInsertWfsData() {
    //TODO: why are there two commit messages here?
    var xml = '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service="WFS" version="1.0.0">' +
        '<wfs:Insert handle="Added feature(s) using wfs-import-export script">' +
        getInsertWfsFeaturesXml() +
        '</wfs:Insert>' +
        '</wfs:Transaction>';

    return xml;
  }

  function verifyAttribuesMap() {
    var url = '/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeNames=' +
        config.sourceLayerName;

    httpService.get(url).then(function(response) {
      console.log('====>> response: ', response);
      var x2js = new X2JS();
      var json = x2js.xml_str2json(response.data);
      console.log(json);

      var url2 = '/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeNames=' +
          config.destinationLayerName + ',' + config.sourceLayerName;

      httpService.get(url2).then(function(response) {
        console.log('====>> response2: ', response);
        var json2 = x2js.xml_str2json(response.data);

        /*
        //var sourceAttributes = json.schema.complexType.complexContent.

        // print status:
        for (var property in config.attributesMap) {
          if (!goog.isDefAndNotNull(attributesStatus[property])) {
            console.log('====[ WARNING: no features used the mapping ');
          }
        }
        */

        console.log(json2);
      });

      /*
      if (response.data ==='blah') {
        for (var key in response.data.features) {
          console.log('---- feature: ', response.data.features[key]);
        }

        featureList = response.data.features;
        if (callback_success) {
          callback_success(featureList);
        }
      } else {
        if (callback_error) {
          callback_error();
        }
      }
      */
    });
  }

  var p = {};

  p.start = function() {
    //verifyAttribuesMap();

    getAllFeatures(function(features) {
      console.log('----[ featurs.length: ', features.length);
      postAllFeatures();

      // print status:
      for (var property in config.attributesMap) {
        if (!goog.isDefAndNotNull(attributesStatus[property])) {
          console.log('====[ WARNING: no features used the mapping ');
        }
      }


      }, function() {
      console.log('====[ Error: failed to get current features of the layer. Not starting test!');
    });

  };

  p.getConfig = function() {
    return config;
  };

  return p;
}());

WfsModule.start();