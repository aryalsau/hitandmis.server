var fs = require('fs');
var clog = require('./clog');

var log;

module.exports.loggingOn = function(){
	log = true;
};

module.exports.loggingOff = function(){
	log = false;
};

module.exports.readConfig = function(configPath,callback){
	fs.readFile(configPath, 'utf8', function (err,content) {
		if (err) {
			if(log) console.log(clog.tick().blue()+' '+'CFG'.abbr().blue()+' : read failed'.red()+' '+err.toString().red());
		} else {
			if(log) console.log(clog.tick().blue()+' '+'CFG'.abbr().blue()+' : read success');
			var config = parseConfig(content)
		}
		if (callback) callback.call(null,err,config)
	});
};

module.exports.writeConfig = function(configPath,JSONconfig,callback){
	config = JSON.parse(JSONconfig);
	fs.writeFile(configPath, 'SITE='+config.site+'\nCAMERA='+config.camera+'\nPATH='+config.path , function(err) {
		if (err) {
			if(log) console.log(clog.tick().blue()+' '+'CFG'.abbr().blue()+' : write failed'.red()+' '+err.toString().red());
		} else {
			if(log) console.log(clog.tick().blue()+' '+'CFG'.abbr().blue()+' : write success');
		}
		if (callback) callback.call(null,err)
	});
};

function parseConfig(rawData){
	var tempArray1 = rawData.split('\n');
	for (var i=0; i<tempArray1.length; i++) {
		var tempArray2 = tempArray1[i].split('=');
		switch (tempArray2[0]) {
			case 'SITE':
				var siteVar = tempArray2[1];
				break;
			case 'CAMERA':
				var camVar = tempArray2[1];
				break;
			case 'PATH':
				var pathVar = tempArray2[1];
				break;
		}
	}
	return {path:pathVar, cam:camVar, site:siteVar};
}

module.exports.loggingOn(); //logging on by default
