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
    frequency: 10000,

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
    workspaceName: 'geonode',

    // attributes and values to set them to when creating a feature
    attributes: {
      evento: 'otro', // nino_perdido, accidente_ambulancia, incidente_de_trafico, danos_y_perjuicios, otro
      fotos: 'eval(JSON.stringify(getRandomPicsArray()))',  // generate a random array of pics and stringify it
      comentarios: 'eval("server1 " + " runCounter: " + runCounter + " date: " + dateLastRun)'
    },

    // list of available operations and a corresponding weight. The higher the weight relative to the other available
    // operations, the more often it will tend to get selected.
    operations: {
      createFeature: 5,
      removeFeature: 2,
      modifyFeature: 3,
      moveView: 0
    },

    // when the camera moves from point a to b, animate it or do and abrupt jump.
    // animated move looks more pleasant and also more heavily tasks the server with WMS requests. When these cases
    // are not of advantage or cause a disadvantage, you may disable animation.
    moveToViewAnimate: false,

    // only modify or remove features that were created by this script. Any features that already existed when 
    // the script was started will not be modified / removed so that if geogit is syncing the underlying repositories
    // no conflicts can arise 
    noConflictMode: true,

    // if the geometry attribute type is not geom, it can be set here. for example, 'the_geom'
    geomAttributeName: 'geom'
  };

  var mapService = angular.element('html').injector().get('mapService');
  var httpService = angular.element('html').injector().get('$http');
  var timeout = null;
  var projection4326 = 'EPSG:4326';
  var projectionMap = mapService.map.getView().getView2D().getProjection().getCode();
  var runCounter = 0;
  var dateLastRun = null;
  var concurrentCompletedCount = 0;
  var featureList = [];
  var myFeaturesList = [];
  var storedPics = ['0173209f6003fe135e5fa0734511c2a51b957e1a.jpg',  
'62b18ea43e98261ffa8c6d4cc881abdd4b062d02.jpg',  
'b03377873ae8f05aedb188e84c905fcaa3ecd343.jpg',
'067e6097c1698410dfb4cb835dda52749aadf5d0.jpg',  
'634b16684938d0c2e1665344d596c8df58af0b90.jpg',  
'b1676f4e0aef18ed304d5b598965ea0bdc841ab8.jpg',
'06bee640c49983aa84fc026c6a777f3d113103af.jpg',  
'64da5ce80653defbac65d4717364baf1ce9a1375.jpg',  
'b19d96c67db2ea970c5ad3b5aa3c9834fb38fd66.jpg',
'09938bc8d10c000e3ae98ee46289770cffff911b.jpg',  
'65141e5a43a2ef0749be7c003737a4124bfc6cbd.jpg',  
'b20aecbded24e1e335520b271c59e14ac6f4829c.jpg',
'09e3fd1acd619abd27d06a78f47e6d3dfdf67c46.jpg',  
'6600ca6a1925f673ee89d7af55fac58367b13d3b.jpg',  
'b4744d30bdb90ed09e1d39d9a8fcc0127dc51ebf.jpg',
'0bcd4ae1b2505591ffce6290065688d88fbd0a85.jpg',  
'66fe9f06476b78983f61c4db67236965e2105fbe.jpg',  
'b4b14c8e9c51a58c06c8e001b54a8447592a7f73.jpg',
'0d9845d00ee809417ac527127b07f7bd52a5e7da.jpg',  
'6758837bc35e5321991aed3237a8f51d8954f64d.jpg',  
'b57bb4492339fd83c9d83007ec3d36e165c35af4.jpg',
'10842e1ae52dc115d63a1b6d8bb2fd894c8b46d0.jpg',  
'6801c39e5a4fa6a13a0ac5c166fd3985bd45a886.jpg',  
'b58e0c870b7734c23184bfb3d3f608da9686e26f.jpg',
'1163a9536d4c8637fdedb65c779a0a5960f0a313.jpg',  
'69c95c25731573780eba9463e0cabdbd1fc6f91e.jpg',  
'b5fbc1143d07262d813062fd210cb3ae547069d3.jpg',
'12df659325d692ba5d6eee5655b0667f1956a9c1.jpg',  
'6b03ee7a5aba17669a4107191294ab3af5861f4d.jpg',  
'b75e429e614b785478778317d47702d5fa2f5aa5.jpg',
'1571e6022d30cc0e199215e6647d133c65f03e7d.jpg',  
'6ec308174c4433a3f178bd03d12d1ed545b4e9d9.jpg',  
'b88f09115fa6112852b83056ea1cc849c58538b3.jpg',
'1636a2f7ef4091b8c6e38ace37599fffa1691414.jpg',  
'6f1ed9cb5d7cdd064731be6811f4fd73dccca757.jpg',  
'b8b40ca408d89e360bcee9b8ea796d3cd7ce5831.jpg',
'168ac9ad97e3b95a87cb9e18d32c34100244c06a.jpg',  
'6f67341d5d485daa5e01c598a8cd31e558fef45b.jpg',  
'bd45a8331c172228b5d8bebf63ed34433707dce8.jpg',
'1777ad7399379799fb800d3f9bd9111679b627df.jpg',  
'706fb5522fa0c2a98329511bb3e822212782c12b.jpg',  
'bd6d1fb04a0f4aae5176aa40e867cf5076f3bccb.jpg',
'17a226287bd80f94a9509f2901491ab176e4bddf.jpg',  
'713fb9bd561e303a8275cc16db05b3e6d6ca5d4d.jpg',  
'bd806946a3317190cadf5851f273e97e7c6d1290.jpg',
'186c02e2a0486daabacd290747995e2cedd0fe1f.jpg',  
'71673d9db9a79dc2e93f5fa4f2b1e63af19af7bf.jpg',  
'bea110b1c1fb866cc5bea4bbc5086a0a0e8e6482.jpg',
'18cea8301356bf08ca0c6aee5c9f6f043ce5d649.jpg',  
'7436156e35ac21142ce7182fe342fa41bc2534b5.jpg',  
'bfc5f39c0dea6ce8aa1a217a97275ee0c14945ac.jpg',
'1d1e3fdb2b23c0193c6b6ede0d79addbc1001e6c.jpg',  
'767d232aa4c72008d2c256229928fea134705781.jpg',  
'c01ecf166333793eeda8e04e48cc1ba3ba473728.jpg',
'1f89bd7e8d5e080b93c7fc60dc82092c5c21cd61.jpg',  
'7768837eff5ebca75a282fc98ffcc54f96291959.jpg',  
'c0df349f4d825b69baf14b6fa86a61a48abe2fc4.jpg',
'20aabdf23b0b92ddcb534c7c75dc0ab017b4d205.jpg',  
'77e191385524a4c7d782749275b543a351e08917.jpg',  
'c0fb529eeae04ca676f328dcf8f7e328c538fa27.jpg',
'20e2e0b7ecab352329b1085d34d64da349f5e426.jpg',  
'780b0cfeddfa847d5bbd5193f85fcc37292382fc.jpg',  
'c348f7c266f136ad20ee0aa37b150df18d923b9a.jpg',
'24a2b48bc5734648463fb288af3a1759e57537c8.jpg',  
'7a245194bc52f30dd64795000bef8e9e3b35682b.jpg',  
'c3845e9ab91505702dfe92b5a35e98b95cf84290.jpg',
'2725af6b752ee1b75f037f585ae54f36fd579dba.jpg',  
'7c3b5a7530ba0bfa64a3251f7eba90b366808b9c.jpg',  
'c7fc6395989ca10af3df23e5b163a39ce1a7179b.jpg',
'28c6da71e40d85f589434c3c7b1f2a8cc59562a3.jpg',  
'7cd52f84469a6b93c8a649a4d47aecfded590266.jpg',  
'c8aec443b11436fd5cbc30ec06fd759691edfce0.jpg',
'2981bfabb5783ca1bea529dbe86a9351f8ea6b2d.jpg',  
'7d035358ccb6c02492dd2d18b5869d89144a40bb.jpg',  
'c90913aefe644eba94c885391d9f8065416d5342.jpg',
'2c190f78a8f73d36c3ef9f1c04772cc458227ccf.jpg',  
'7d4c2d5f4dc564894b6fd432abee14149b189629.jpg',  
'c95a5e1f42030d422fa3b0b7467d7229eda2f99e.jpg',
'2e2f283b84dd1285701de2a15183ef5b85a0532f.jpg',  
'7d595de7178ce223893d6a4b4b5668510e487a99.jpg',  
'ca5aea5783f148495d25414660ccb70c020308ef.jpg',
'2f9afc6b1aaf5c3b46503aad19625dadaa991821.jpg',  
'7eddc2889c8bc3ba8ba652adbe371892f48c175f.jpg',  
'ca8c6dc366f88829ed65d747323d4fefa857acec.jpg',
'2ff7838ed9b3958b8492e84a774fc7221d71d4cf.jpg',  
'7f7062db331c2d57913a12bcf0609d939ecc2d1e.jpg',  
'cb745749f8aa884e5ed243fff7fe45379aa832f4.jpg',
'306844312d53ed6b148037e2137760b0f35aec58.jpg',  
'7fcfeaa27cfe83bc1a5f1dd71cc1c1027ed8fa23.jpg',  
'cc89b40f2173df024b9267b8c4d65fa1860f1e50.jpg',
'32d84535d6de799b9051a4137fe2f8511b6a38eb.jpg',  
'80a5f01825f2b40e438b8dded264cccb918a47ea.jpg',  
'ccbe450467af7fda927fb624619c5a074efbdf1a.jpg',
'365babb983adfb2e92002887119aea6a206ad8c1.jpg',  
'81441426797059bff4644fb4d4423417b601ff18.jpg',  
'cf07a8a8a9653db7af7f435a17bd72d9f8606ea8.jpg',
'368133958b37e0d91f1012faa415418442cafa9e.jpg',  
'841ba41787e5a41fdd18c3cb605f97154777fce5.jpg',  
'cfbc35869369a4dcd816bbc9b3eba645ccf799d2.jpg',
'369d11082a5b4cad2f0f8cf754c194ba2fb54a73.jpg',  
'84aacd9168dde2abe6a48f9737bbdce574ca7051.jpg',  
'd1f0caa7a8ccd02144211a133c911ced7ce5b403.jpg',
'37b06a14b5a396779d37b1c70b0b1d80d6894875.jpg',  
'85a1b4fcba8f92e7594f6be604fa8f4f20a6d5b1.jpg',  
'd26e2d213c3332805c00461ad248566ed3ef65db.jpg',
'37d3b32d7357d8858b225eb0ae3e81a7cd13a7a2.jpg',  
'86c0b874d9235fbc71736f73399a01e528ae1bcc.jpg',  
'd2f24aacc38379e13916a17a0b0ebd9d571e3dfe.jpg',
'3858b0158dd4e1fa282dd20be6caaadad470319d.jpg',  
'872028e67d08f8882c2e509a1cb84029f852f74f.jpg',  
'd3961789a85c3f87433c55f6fd46d95b52cf79e4.jpg',
'38d78ccd533225e6ae3e656bead4eece9f9e41f8.jpg',  
'876c41196777a3a68631ad56a4f6ae6a2749b4d5.jpg',  
'd5da9a361e3db9d9c47bfc934cd8e2ac54087057.jpg',
'393b5d45058665e3a5789afa9b28d773ab27f7a7.jpg',  
'89431c151db0a0945d6b3556e4cc5fc53506b293.jpg',  
'd7bb0efb29b37ddf5dd45b1e8560ee5e45d56fa2.jpg',
'39af575d9c558a7be2cc60f9fcff84ac6063189d.jpg',  
'8a7ef95fcc91fc000a51063f877ff6660e6c9ca3.jpg',  
'd842e597c8d2b2f6a4a6f9f807f7faec3d92440b.jpg',
'3a059a8e28b55790bb90a944b0b86a1fbabd8c72.jpg',  
'8ac59383b2bb0b9dce6e3316f58e43968d3d5a84.jpg',  
'd877e11397df84c5afca0c8637a9c0132e33bd02.jpg',
'3a22af16870f1ab1b2b7c87a1e07defa5cf45a17.jpg',  
'8b30168424ffbbf76d7dd4cfcbde5f30491f2f3e.jpg',  
'd8a4d42f3bbdba00db31c5a06dca50d7cb4c0aa3.jpg',
'3a60f8fbd8dad1b49eaa7161003b574576d420f8.jpg',  
'8be4671c48706701c7b46259ea676a799ab922ec.jpg',  
'd98750172ce4fd31d62b51e542c1502fe0e27c5e.jpg',
'3a69fb5d5a4eadf12e21e8047d406e322240b312.jpg',  
'8c02438cce08ce6eac51a1606a5c64053866afe9.jpg',  
'da3eb49e8e6f21b6e4fae7b77ef7c7b69f4c0c4e.jpg',
'3ae4b1e80cb5067f3edc65016c8c00baadb27fa7.jpg',  
'8c224282b5bb34c3d676923ba1aa6e1a1b969802.jpg',  
'dac7139b3fa3c1bba17610241aed5fad672ec7b4.jpg',
'3cef06c79f8887e5643fda2c2c5300ec7b3637bf.jpg',  
'8c4bb3717c47e10169be3dca609894111696aae4.jpg',  
'dacd9d5df89cd12b6234a2762d5c1a68a62ba104.jpg',
'3f80af0c6cca965871b57c4d20817a7ec8420173.jpg',  
'8c8f6809524574115cc6c63969f2c8043b14f715.jpg',  
'dbccbbb885fa4ec0db479db33335c74dcaacb0cb.jpg',
'40b647412d46f2d20d97472328f1e01d549226b3.jpg',  
'8d3ebdffc00f4172d8ad1e27c87d267a6b378317.jpg',  
'dbe3c1996f720270d82e28ab435ebc378dcd5656.jpg',
'42682c7ffe81013e7196220ad3ef7d247f87345f.jpg',  
'8d839baa338afd24b92d7644e6740e49a804a1f9.jpg',  
'dc7f4bd7c4fb2f4a4505377cec2256f2bea157a9.jpg',
'42d8a37ae0c690cb1f8600115e3065f738fd6d6a.jpg',  
'8ec3faa03817f8f5561d8f1251c281b829721d4e.jpg',  
'dc86d4407f57972f7b19f10307c6ddd05bb689a3.jpg',
'433da64f5bb850476531a52aeddfb6dbad62daeb.jpg',  
'90212d3492c549358429d7a284a7e45609d41047.jpg',  
'dee21ab50cc8b45a98e835441f17bbcabbcacc73.jpg',
'43916072c4d50a46cd7582c42f48c710acdd8579.jpg',  
'9045d62402674efe2385e279aac3ff4ca56b8fd3.jpg',  
'e0816674fc83792fe3acccdc09e9f2e0501c6200.jpg',
'44fffc938c28b0be60f0d008bbf19c5a7e1e61ef.jpg',  
'933e032376041d08fd4f107e6ccd34473e3c6806.jpg',  
'e0a10dccf866d022a349a671ff659f35e0950916.jpg',
'47a45605aba9718b413e914e14ba5be9952d8a49.jpg',  
'9368c736bf902934396782ae58dbc506f73a2d05.jpg',  
'e18314d815d94ee472657dace4ba77dbf8126571.jpg',
'47c0e4df2167a7230a94682e5fc6ad38da613ab1.jpg',  
'9462b578f9ba37f63bec04331b11a4b1c2a4c65a.jpg',  
'e2c1224a44b1466623cad7f9bf514b54ee4213c3.jpg',
'481c876338beadd5bfd601824f7b3615d18fc3e6.jpg',  
'966dba126256a92b0251ecb496c2780da6cfd515.jpg',  
'e6a2c4ca5ce540b1a8917ce609c4274dbd76e66a.jpg',
'4881f684933f8d829dc5288c8ca3b3b39652469e.jpg',  
'97e7ea77b418fa17a670c6228b17f9ab39f18b3c.jpg',  
'e7b58fecab7ba79af37b8deb924135c14203a36e.jpg',
'498ff10dde49092237f8ada9b68945c1a6b8596a.jpg',  
'9845cda1168993ce91f1026a5cfbb823b2624049.jpg',  
'e9019a7b70b4ac21e9b50072782088f41ea8753b.jpg',
'49c920cf570b381403b63dc5adc1ca0b7eaf5385.jpg',  
'99160a377d76af63b2aba92301eb77f166bd828f.jpg',  
'e9a8728f0dcae8ca33213aaaa5deab240ef9182d.jpg',
'4a4a63763536afbd0fff45ac4ec4f35dc936923f.jpg',  
'99385ba862e1c46dd04b8153d35a5bf9d22e44c9.jpg',  
'eb83c921eb9dd66adf8e7569c0ffb010c117080d.jpg',
'4a8fa4fe463444cf5f54edd5b0a084908e0bafd9.jpg',  
'99d80e7c610a4da10fd1e4b7aa3789fd65470e5c.jpg',  
'ec55bc02034e6a4c64a5624ff4f70b3f110b35b1.jpg',
'4c2f9298bed63cd9e23d4e01f89d6ecfc97ffedb.jpg',  
'9a3f6c9d36f99b219033ffd6639d33d6d76e400d.jpg',  
'ecc8300fed16b4b40647c07415606e237bfa1aa7.jpg',
'4d37cbbdb75ccb86ccf64def079cf37e37fefc39.jpg',  
'9c4b4eaaeb14a8700fbd82a8e61830f117c8a874.jpg',  
'ed0395b2a689bcf506b4f798bd9b673057e84d46.jpg',
'4d6edc80cb4b23a5bb59e0c8561367fce7cf9a47.jpg',  
'9c645e98bc3175a8114c959beb71d1a245817965.jpg',  
'ed703bb57ceb99c27ba597c988044c28e2fe2e68.jpg',
'4ddcc4865ca7e6153d9c3478c12afb935fd2e44b.jpg',  
'9ce05326d35561205c2cc27e6b45eff79f9ac957.jpg',  
'ee654d024e857bf457df23a81ccf031050d89ca1.jpg',
'4e3df540219bdabf556fa3283c5115813a4a018a.jpg',  
'9d37dc6e974f30dbdd4274e0051b4c016b194fc0.jpg',  
'ef272a8336af457fc7cbdbe640905eaf3c513a53.jpg',
'4f482c3e363f31715871e0a411d83c66b556f063.jpg',  
'a0002b5e919bd8168202a1d55348f1adb3991de4.jpg',  
'ef86c8fbde1412875f851a17ce76a116d4e23ffe.jpg',
'4f4e2a5434bb609e737cebb1028b27ae61934b78.jpg',  
'a013f65ce115f994ccb20293ff07f6ef35812e1d.jpg',  
'f1207afcbc34a6929df9754213cd98247d3274bb.jpg',
'4f7cafe0a89653e73b7b65fa345fb3016e6c43cb.jpg',  
'a077e568f45588a9775342daaa269fb3751a415b.jpg',  
'f1def12378c19956d240dc5d1575c38744e00788.jpg',
'51b5d69bce735af953ea54518cc37c3928fd9bd2.jpg',  
'a27967e04eb4b379d105bbb6975eb58332c194ea.jpg',  
'f20685c6ab139bbb5caacd268498ecbd20376c0d.jpg',
'51f942df97b376527e42096013557dfcd11bae87.jpg',  
'a49f9e30fd8ac65d76feee66ec43317559779e21.jpg',  
'f2bea3221afe89e65b8e1b4f26a6e50f07eb1281.jpg',
'54b13b9499804bd87872261cdbc345b55008ddea.jpg',  
'a574e4fd274cd877e11a569457fec1bb7e51e5b8.jpg',  
'f3aa7603398e89550966c765c2d941cb62dfa017.jpg',
'55eb81a40e2031bb8cf3f21b8d6b72a77da36240.jpg',  
'a5ad705da114e927c4c5e77c8fed7a3c3cd30dca.jpg',  
'f3b50e32fb62a64bf28b6030175fc37d0d92ebcc.jpg',
'5664d76f8fd6c32de3ba78901861a819e21027b1.jpg',  
'a71876d6e3831934ec95626275b861b89380a19f.jpg',  
'f5cd88faea87a1ded735845464b4232329a25b95.jpg',
'5896fcb50c34d9d49e0cc629a035556a814ceb86.jpg',  
'a7bfaffdc21900d25ea7d8fe06df7b1ed3b46dd4.jpg',  
'f627d32ff2bf28b8aa5fd60aa72a1b68c76cdeb8.jpg',
'5a02ce51592cd453d212cf4d1dfeefd221e9912b.jpg',  
'aac74f88b3f961c9baa5b8f483d075b3892dcae5.jpg',  
'f659a7d4a42eb42d4c9b77e91b2bd8ef55062f80.jpg',
'5a591fd5ac38f568f80b370c84dc7ef39b6fa336.jpg',  
'abcb92756c41a2a2e99c8f793cef4ab590f3a9b5.jpg',  
'f6ace59765e0e326c1e1f9b0789ad383d794e7a3.jpg',
'5b2176bf1fb1f9701f929271c4c5d83ef23faf37.jpg',  
'ac5062b53241b8f4c71eecebca249e4a51e7bca5.jpg',  
'f9dd235fa27f547653dc1783edf0aed48f50f234.jpg',
'5b98445844ed289eedc5083c7b01f9ce4e8a10c9.jpg',  
'ad58b213fc92cc5c7b62fd7d404955f2ab6dbb0b.jpg',  
'faa4a2f26160bd7e97e9468db9a42a16d6f97bdf.jpg',
'5d2308641a80686ed3590b71557eeedbdc2b0eec.jpg',  
'ad6abf7b4c7f35c83776efbe34f7a21afee0eb74.jpg',  
'fc889201a8d9ddfa9ec5098c3387a4b57f56ea2c.jpg',
'5d528833cf816a10a3b8141634d2c7807c590bbb.jpg',  
'ad91f8e41a53a472a530e2d793584a3740954e44.jpg',  
'ff4f28e4e80a721577f6b6944ea8c51d6b382bea.jpg',
'615e25e812a5e4671a44f4fd486115ccf346d866.jpg',  
'adb86621bde8464951514122c0b0032ec11e4eee.jpg',  
'ffb1e31c7b058f45a774f8ad166528c5032eb0ab.jpg',
'61eec3a9d139e80251bdec6ca1961ca9f4022147.jpg',  
'ae6e6c54364014ae1665f9511ae970c7af643530.jpg',
'624f5e0cf2618cbbd947299cfac9eb5125f220bc.jpg',  
'aed1354c6ee4d919fdb1ae7851534f9e2d488ee4.jpg'];

  // returns floating point number. min inclusive, max exclusive
  function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  // returns an integer. min inclusive, max exclusive
  function getRandomIntegerBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function getRandomView() {
    var lat = getRandomBetween(config.latMin, config.latMax);
    var lon = getRandomBetween(config.lonMin, config.lonMax);
    var zoom = getRandomIntegerBetween(config.zoomMin, config.zoomMax);
    var point = new ol.geom.Point([lon, lat]);
    var transform = ol.proj.getTransform(projection4326, projectionMap);
    point.transform(transform);

    return {
      center: point.getCoordinates(),
      zoom: zoom
    };
  }

  function getViewFromFeature(feature) {
    var point = new ol.geom.Point($.extend(true, [], feature.geom.coords));
    var transform = ol.proj.getTransform(projection4326, projectionMap);
    point.transform(transform);
    return {
      center: point.getCoordinates(),
      zoom: getRandomIntegerBetween(config.zoomMin, config.zoomMax)
    };
  }

  function getRandomPicsArray() {
    //TODO: select a random pic from teh ones available on the file-service and return it
    var pics = [];

    // 0 through 4 pics
    var picsLength = getRandomIntegerBetween(0, 5);

    if (picsLength > 0) {
      for (var i = 0; i < picsLength; i++) {
        //TODO: randomly get a pic name from available pics in the file-service
        var picName = storedPics[getRandomIntegerBetween(0, storedPics.length)];
        if(pics.indexOf(picName) === -1) {
           pics.push(picName);
        }
      }
    }

    return pics;
  }

  // randomly select an operation based on the user specified weights of the operations
  function getRandomOperation() {
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

    alert('error: getRandomOperation failed! should never hit this');
  }

  function run() {
    runCounter += 1;
    dateLastRun = new Date();

    var op = getRandomOperation();

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
      var feature = getRandomFeature(true);
      if (!goog.isDefAndNotNull(feature)) {
        setTimerAfterConcurrentsComplete();
        continue;
      }
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
      var feature = getRandomFeature();
      if (!goog.isDefAndNotNull(feature)) {
        setTimerAfterConcurrentsComplete();
        continue;
      }
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

  function moveToView(view) {
    if (config.moveToViewAnimate) {
      var pan = ol.animation.pan({source: mapService.map.getView().getView2D().getCenter()});
      var zoom = ol.animation.zoom({resolution: mapService.map.getView().getView2D().getResolution()});
      mapService.map.beforeRender(pan, zoom);
    }

    mapService.map.getView().getView2D().setCenter(view.center);
    mapService.map.getView().getView2D().setZoom(view.zoom);
  }

  function getInsertWfsData(lon, lat) {
    var attributesXML = '';

    for (var attribute in config.attributes) {
      var value = config.attributes[attribute];
      // if the attribute value starts with 'eval(' evaluate the string. lat, lon will resolve so will any thing
      // else visible to the scope
      if (value.indexOf('eval(') === 0) {
        value = value.substring('eval('.length, value.length - 1);
        value = eval(value);
      }
      attributesXML += '<feature:' + attribute + '>' + value + '</feature:' + attribute + '>';
    }

    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;added&quot;:1}}" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Insert handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;added&quot;:1}}">' +
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

  function getRemoveWfsData(feature) {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;removed&quot;:1}}" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Delete xmlns:feature="http://www.geonode.org/"  handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;removed&quot;:1}}" typeName="' +
        config.workspaceName + ':' + config.layerName + '">' +
        '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' +
        '<ogc:FeatureId fid="' + feature.fid + '"/>' +
        '</ogc:Filter>' +
        '</wfs:Delete>' +
        '</wfs:Transaction>';
  }

  function getUpdateWfsData(feature, newPosition) {
    return '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'service= "WFS" version="1.1.0" handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;modified&quot;:1}}" ' +
        'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
        '<wfs:Update xmlns:feature="http://www.geonode.org/" handle="' +
        '{&quot;' + config.layerName + '&quot;:{&quot;modified&quot;:1}}" typeName="' +
        config.workspaceName + ':' + config.layerName + '">' +
        '<wfs:Property>' +
        '<wfs:Name>' + config.geomAttributeName +
        '</wfs:Name>' +
        '<wfs:Value>' +
        '<gml:Point xmlns:gml="http://www.opengis.net/gml" srsName="' + projectionMap + '">' +
        '<gml:pos>' + newPosition[0] + ' ' + newPosition[1] + '</gml:pos>' +
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

  function getRandomFeature(removeFromList) {
    var index;
    var feature;
    if (config.noConflictMode) {
      // Work off of myFeatureList
      index = getRandomIntegerBetween(0, myFeaturesList.length);
      if (removeFromList) {
        // Remove it from both lists
        feature = myFeaturesList.splice(index, 1)[0];
        featureList.splice(index, 1);
      } else {
        feature = myFeaturesList[index];
      }
    } else {
      // Work off of featureList
      index = getRandomIntegerBetween(0, featureList.length);
      if (removeFromList) {
        // Remove it from featureList
        feature = featureList.splice(index, 1)[0];
        index = myFeaturesList.indexOf(feature);
        // Check to see if this was feature we added
        if (index !== -1) {
          // We added this feature so we need to remove it from myFeaturesList as well
          myFeaturesList.splice(index, 1);
        }
      } else {
        feature = featureList[index];
      }
    }

    return feature;
  }

  function getAllFeatures() {
    var url = '/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=' + config.workspaceName + ':' +
        config.layerName;

    httpService.get(url).then(function(response) {
      var x2js = new X2JS();
      var json = x2js.xml_str2json(response.data);
      if (goog.isDefAndNotNull(json.FeatureCollection.member)) {
        forEachArrayish(json.FeatureCollection.member, function(feature) {
          var srs = feature[config.layerName][config.geomAttributeName].Point._srsName.split(':');
          srs = 'EPSG:' + srs[srs.length - 1];
          var coords = feature[config.layerName][config.geomAttributeName].Point.pos.__text.split(' ');
          coords = [parseFloat(coords[1]), parseFloat(coords[0])];
          if (srs !== projection4326) {
            var point = new ol.geom.Point(coords);
            var transform = ol.proj.getTransform(srs, projection4326);
            point.transform(transform);
          }
          featureList.push({
            'fid': feature[config.layerName]['_gml:id'],
            'geom': {
              'srsName': projection4326,
              'coords': coords
            }
          });
        });
      }
      //-- finally start by calling the run functions
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
                  ' post duration: ', (Date.now() - timeInMillies));
              var x2js = new X2JS();
              var json = x2js.xml_str2json(data);
              var point = new ol.geom.Point([lon, lat]);
              var transform = ol.proj.getTransform(projectionMap, projection4326);
              point.transform(transform);
              var newFeature = {
                'fid': json.TransactionResponse.InsertResults.Feature.FeatureId._fid,
                'geom': {
                  'srsName': projection4326,
                  'coords': point.getCoordinates()
                }
              };
              featureList.push(newFeature);
              myFeaturesList.push(newFeature);
              if (callback_success) {
                callback_success();
              }
            } else if (data.indexOf('ExceptionReport') !== -1) {
              console.log('====[ TestModule. Wfs Transaction Exception occured: ', data, status, headers, config);
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
              console.log('====[ TestModule. Unknown Status or Error #1: ', data, status, headers, config);
              p.stop();
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
            p.stop();
            alert('Wfs-T Unknown Status or Error. See console for response.');
            if (callback_error) {
              callback_error();
            }
          }
        });
  }

  function removeFeature(feature, callback_success, callback_error) {
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var timeInMillies = Date.now();

    var url = '/geoserver/wfs/WfsDispatcher';
    httpService.post(url, getRemoveWfsData(feature), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalDeleted>1</wfs:totalDeleted>') !== -1) {
              console.log('---- deletedFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                  ' post duration: ', (Date.now() - timeInMillies));
              if (callback_success) {
                callback_success();
              }
            } else if (data.indexOf('ExceptionReport') !== -1) {
              console.log('====[ TestModule. Wfs Transaction Exception occured: ', data, feature, status, headers, config);
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
              console.log('====[ TestModule. Unknown Status or Error #1: ', data, feature, status, headers, config);
              p.stop();
              alert('Wfs-T Unknown Status or Error. See console for response.');
              if (callback_error) {
                callback_error();
              }
            }
          } else if (status === 401) {
            console.log('====[ Error: Wfs Transaction, Unauthorized: ', data, feature, status, headers, config);
            alert('TestModule. Wfs-T, unauthorized. Verify username: ' + config.username +
                ', password: ' + config.password);
            if (callback_error) {
              callback_error();
            }
          } else {
            console.log('====[ TestModule. Unknown Status or Error #2: ', data, feature, status, headers, config);
            p.stop();
            alert('Wfs-T Unknown Status or Error. See console for response.');
            if (callback_error) {
              callback_error();
            }
          }
        });
  }

  function modifyFeature(feature, callback_success, callback_error) {
    if (config.username && config.password && (typeof config.headerData === 'undefined')) {
      config.headerData = {
        'Content-Type': 'text/xml;charset=utf-8',
        'Authorization': 'Basic ' + $.base64.encode(config.username + ':' + config.password)
      };
    }

    var timeInMillies = Date.now();

    var url = '/geoserver/wfs/WfsDispatcher';
    if (feature.geom.srsName !== projection4326) {
      console.log('====[ Somehow this feature has the wrong projection', feature.geom.srsName);
    }
    var point = new ol.geom.Point($.extend(true, [], feature.geom.coords));
    var randomLat = getRandomBetween(-1.0, 1.0);
    var randomLon = getRandomBetween(-1.0, 1.0);
    point.getCoordinates()[0] += randomLon;
    point.getCoordinates()[1] += randomLat;
    if (point.getCoordinates()[0] > config.lonMax || point.getCoordinates()[0] < config.lonMin ||
        point.getCoordinates()[1] > config.latMax || point.getCoordinates()[1] < config.latMin) {
      console.log('====[ Could not update feature, new position went out of bounds');
      if (callback_success) {
        callback_success();
      }
      return;
    }
    var transform = ol.proj.getTransform(projection4326, projectionMap);
    point.transform(transform);

    httpService.post(url, getUpdateWfsData(feature, point.getCoordinates()), {headers: config.headerData})
        .success(function(data, status, headers, config) {
          if (status === 200) {

            // if a feature was inserted, post succeeded
            if (data.indexOf('<wfs:totalUpdated>1</wfs:totalUpdated>') !== -1) {
              console.log('---- updatedFeature success @ ' + dateLastRun + '. runCounter: ' + runCounter +
                  ' post duration: ', (Date.now() - timeInMillies));
              transform = ol.proj.getTransform(projectionMap, projection4326);
              point.transform(transform);
              feature.geom.coords = point.getCoordinates();
              if (callback_success) {
                callback_success();
              }
            } else if (data.indexOf('ExceptionReport') !== -1) {
              console.log('====[ TestModule. Wfs Transaction Exception occured: ', data, feature, status, headers, config);
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
              console.log('====[ TestModule. Unknown Status or Error #1: ', data, feature, status, headers, config);
              p.stop();
              alert('Wfs-T Unknown Status or Error. See console for response.');
              if (callback_error) {
                callback_error();
              }
            }
          } else if (status === 401) {
            console.log('====[ Error: Wfs Transaction, Unauthorized: ', data, feature, status, headers, config);
            alert('TestModule. Wfs-T, unauthorized. Verify username: ' + config.username +
                ', password: ' + config.password);
            if (callback_error) {
              callback_error();
            }
          } else {
            console.log('====[ TestModule. Unknown Status or Error #2: ', data, feature, status, headers, config);
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
