var fs = require('fs');
var winston = require('winston');

module.exports.read = function(configPath, callback, data){
	callback.bind(configPath, data);
	fs.readFile(configPath, 'utf8', function (err, content) {
		if (err) {
			winston.info('config read failed : '+err.toString());
		} else {
			winston.info('config read success');
			data = configParser(content);
			if (callback) callback(data);
		}
	});
};

module.exports.readSync = function(configPath){
	return parseConfig(fs.readFileSync(configPath,'utf8'));
};

parseConfig = function(configString){
	var parts = configString.split(/[=\n]/);
	var jsonObj = {};
	jsonObj[parts[0]] = parts[1];
	jsonObj[parts[2]] = parts[3];
	jsonObj[parts[4]] = parts[5];
	return jsonObj;
};

module.exports.write = function(configPath, JSONconfig, callback){
	config = JSON.parse(JSONconfig);
	fs.writeFile(configPath, 'site='+config.site+'\ncamera='+config.camera+'\npath='+config.path , function(err) {
		if (err) {
			winston.info('config write failed : '+err.toString());
		} else {
			winston.info('config write success');
			if (callback) callback.call();
		}
	});
};

var configParser = function(rawData){
	var tempArray1 = rawData.split('\n');
	for (var i=0; i<tempArray1.length; i++) {
		var tempArray2 = tempArray1[i].split('=');
		switch (tempArray2[0]) {
			case 'site':
				var siteVar = tempArray2[1];
				break;
			case 'camera':
				var cameraVar = tempArray2[1];
				break;
			case 'path':
				var pathVar = tempArray2[1];
				break;
		}
	}
	return {path:pathVar, camera:cameraVar, site:siteVar};
};

//site=Umass LOCSST lab
//camera=Princeton Instruments PIXIS 1024
//path=data