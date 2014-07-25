"use strict";jQuery.base64=(function($){var _PADCHAR="=",_ALPHA="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_VERSION="1.0";function _getbyte64(s,i){var idx=_ALPHA.indexOf(s.charAt(i));if(idx===-1){throw"Cannot decode base64"}return idx}function _decode(s){var pads=0,i,b10,imax=s.length,x=[];s=String(s);if(imax===0){return s}if(imax%4!==0){throw"Cannot decode base64"}if(s.charAt(imax-1)===_PADCHAR){pads=1;if(s.charAt(imax-2)===_PADCHAR){pads=2}imax-=4}for(i=0;i<imax;i+=4){b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6)|_getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,(b10>>8)&255,b10&255))}switch(pads){case 1:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12)|(_getbyte64(s,i+2)<<6);x.push(String.fromCharCode(b10>>16,(b10>>8)&255));break;case 2:b10=(_getbyte64(s,i)<<18)|(_getbyte64(s,i+1)<<12);x.push(String.fromCharCode(b10>>16));break}return x.join("")}function _getbyte(s,i){var x=s.charCodeAt(i);if(x>255){throw"INVALID_CHARACTER_ERR: DOM Exception 5"}return x}function _encode(s){if(arguments.length!==1){throw"SyntaxError: exactly one argument required"}s=String(s);var i,b10,x=[],imax=s.length-s.length%3;if(s.length===0){return s}for(i=0;i<imax;i+=3){b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8)|_getbyte(s,i+2);x.push(_ALPHA.charAt(b10>>18));x.push(_ALPHA.charAt((b10>>12)&63));x.push(_ALPHA.charAt((b10>>6)&63));x.push(_ALPHA.charAt(b10&63))}switch(s.length-imax){case 1:b10=_getbyte(s,i)<<16;x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_PADCHAR+_PADCHAR);break;case 2:b10=(_getbyte(s,i)<<16)|(_getbyte(s,i+1)<<8);x.push(_ALPHA.charAt(b10>>18)+_ALPHA.charAt((b10>>12)&63)+_ALPHA.charAt((b10>>6)&63)+_PADCHAR);break}return x.join("")}return{decode:_decode,encode:_encode,VERSION:_VERSION}}(jQuery));

var WfsModule = (function() {

  var config = {
    // username and password to connect to geoserver when making a Wfs Transaction
    username: 'syrusm',
    password: '',

    sourceLayerName: 'geonode:Muestreo_Pila',
    destinationLayerName: 'geonode:muestreo_pilas',
    workspaceURL: 'http://www.geonode.org/',

    destinationSrs: 'EPSG:4326',

    forceDestinationAttribsToLower: true,

    // source: destination
    attributesMap: {
      fecha_hora: 'Fecha_de_levantamiento',
      Levanto: 'Nombre_quien_Levanto',
      Codigo: 'Codigo',
      Departamen: 'Departamento',
      Municipio: 'Municipio',
      Ciudad: 'Ciudad',
      Barrio_Col: 'Barrio_o_Colonia',
      Aldea_cace: 'Aldea_o_Cacerio',
      Ubicacion: 'Direccion_exacta',
      Beneficiar: 'Nombre_del_beneficiario',
      Identidad: 'Numero_de_identidad',
      Est_civil: 'Estado_civil',
      Conyugue: 'Nombre_del_conyugue',
      N_Hijos: 'Numero_de_hijos',
      Telefono: 'Numero_de_telefono',
      Ac_Laboral: 'Actividad_laboral_del_beneficiario',
      doc_terren: 'Documento_de_propiedad',
      fotos: 'fotos',
      the_geom: 'geom'
    }
  };

  var mapService = angular.element('html').injector().get('mapService');
  var httpService = angular.element('html').injector().get('$http');
  var featureList = [];
  var sourceAttributes = {};
  var destinationAttributes = {};
  var sourceLayerNameWithoutWorkspace = null;
  var destinationLayerNameWithoutWorkspace = null;

  function removeWorkspaceFromLayerName(workspaceLayerName) {
    var colonIndex = workspaceLayerName.indexOf(':');
    if (colonIndex === -1) {
      return workspaceLayerName;
    } else {
      return workspaceLayerName.substring(colonIndex+1);
    }
  }

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

  function getDestinationProperty(sourceProperty) {

  }

  function getInsertWfsFeaturesXml() {
    var xml = '';
    var geometryName = null;
    console.log('==== featureList: ', featureList);
    for (var index in featureList) {
      var feature = featureList[index];
      var attributesXML = '';
      console.log('---- feature: ', feature);
      for (var property in feature.properties) {
        var value = feature.properties[property];
        if (goog.isDefAndNotNull(value)) {
          // if there is a mapping for this attribute, lookup what the destination should be
          if (goog.isDefAndNotNull(config.attributesMap) && goog.isDefAndNotNull(config.attributesMap[property])) {
            property = config.attributesMap[property];
          }
          attributesXML += '<feature:' + property + '>' + value + '</feature:' + property + '>';
        }
      }
      console.log('---- feature, attributesXML: ', attributesXML);
      // if there is a mapping for geometry name, use it
      if (geometryName === null) {
        if (goog.isDefAndNotNull(config.attributesMap[feature.geometry_name])){
          geometryName = config.attributesMap[feature.geometry_name];
        } else {
          geometryName = feature.geometry_name;
        }
      }

      xml += '' +
          '<feature:' + destinationLayerNameWithoutWorkspace + ' xmlns:feature="' + config.workspaceURL + '">' +
            '<feature:' + geometryName + '>' +
              '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="' + config.destinationSrs + '">' +
                '<gml:coordinates decimal="." cs="," ts=" ">' + feature.geometry.coordinates[0] + ',' + feature.geometry.coordinates[1] + '</gml:coordinates>' +
              '</gml:Point>' +
            '</feature:' + geometryName + '>' +
            attributesXML +
          '</feature:' + destinationLayerNameWithoutWorkspace + '>';
    }
    return xml;
  }

  function getInsertWfsData() {
    //TODO: why are there two commit messages here?
    var xml = '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service="WFS" version="1.0.0" handle="Imported features from layer ' + sourceLayerNameWithoutWorkspace + ' into layer ' + destinationLayerNameWithoutWorkspace + ' using wfs-import script">' +
        '<wfs:Insert>' +
        getInsertWfsFeaturesXml() +
        '</wfs:Insert>' +
        '</wfs:Transaction>';

    return xml;
  }

  function verifyAttribuesMap(successCallback, errorCallback) {

    // if option is set, convert all destination attribs to lower case.
    if (goog.isDefAndNotNull(config.forceDestinationAttribsToLower) &&
        config.forceDestinationAttribsToLower == true) {
      for (var property in config.attributesMap) {
        var destinationProperty = config.attributesMap[property];
        if ( destinationProperty !== destinationProperty.toLowerCase()) {
          config.attributesMap[property] = destinationProperty.toLowerCase();
        }
      }
      console.log('----> lowered destination properties: ', config.attributesMap);
    }

    var url = '/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeName=' +
        config.sourceLayerName;

    httpService.get(url).then(function(response) {
      var x2js = new X2JS();
      var json = x2js.xml_str2json(response.data);
      console.log('------->> json: ', json);

      var sequence = json.schema.complexType.complexContent.extension.sequence.element;
      for (var i = 0; i < sequence.length; i++) {
        var item = sequence[i];
        sourceAttributes[item._name] = item;
      }
      console.log('source attributes: ' , sourceAttributes);

      var url2 = '/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeName=' +
          config.destinationLayerName;

      httpService.get(url2).then(function(response) {
        var json2 = x2js.xml_str2json(response.data);

        var sequence2 = json2.schema.complexType.complexContent.extension.sequence.element;
        for (var i = 0; i < sequence2.length; i++) {
          var item = sequence2[i];
          destinationAttributes[item._name] = item;
        }
        console.log('destination attributes: ' , destinationAttributes);

        for (var property in config.attributesMap) {
          var destinationProperty = config.attributesMap[property];
          var sourceProperty = property;

          if (!goog.isDefAndNotNull(destinationProperty)) {
            console.log('====[ ERROR: invalid destination attribute in attributesMap: ', destinationProperty);
            if (errorCallback) {
              errorCallback();
            }
            return;
          }

          if (!goog.isDefAndNotNull(sourceProperty)) {
            console.log('====[ ERROR: invalid source attribute in attributesMap: ', sourceProperty);
            if (errorCallback) {
              errorCallback();
            }
            return;
          }

          if (!goog.isDefAndNotNull(destinationAttributes[destinationProperty])) {
            console.log('====[ ERROR: destination attribute: ', destinationProperty, 'not in layer: ', destinationAttributes);
            if (errorCallback) {
              errorCallback();
            }
            return;
          }

          if (!goog.isDefAndNotNull(sourceAttributes[sourceProperty])) {
            console.log('====[ ERROR: source attribute: ', sourceProperty, 'not in layer: ', sourceAttributes);
            if (errorCallback) {
              errorCallback();
            }
            return;
          }
        }

        if (successCallback) {
          successCallback();
        }
      });
    });
  }

  var p = {};

  p.start = function() {
    var successCallback = function(){
      console.log('----> Mapping validated');
      getAllFeatures(function(features) {
        console.log('----[ featurs.length: ', features.length);
        postAllFeatures();
      }, function() {
        console.log('====[ Error: failed to get current features of the layer. Not starting test!');
      });
    };

    var errorCallback = function(){
      console.log('====[ ERROR: validation error');
    };

    sourceLayerNameWithoutWorkspace = removeWorkspaceFromLayerName(config.sourceLayerName);
    destinationLayerNameWithoutWorkspace = removeWorkspaceFromLayerName(config.destinationLayerName);
    verifyAttribuesMap(successCallback, errorCallback);
  };

  p.getConfig = function() {
    return config;
  };

  return p;
}());

WfsModule.start();
