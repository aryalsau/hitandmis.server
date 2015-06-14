var fs = require('fs');
var clog = require('./clog');

var configFile = '../camdaemon/config.cfg'

module.exports.writeConfig = function (configData,callback){

    fs.writeFile(configFile, 'CAMDAEMON_SITE='+configData.site+'\n'+
                             'CAMDAEMON_CAM='+configData.camera+'\n'+
                             'CAMDAEMON_PATH='+configData.path, function(){
        callback();
        console.log(clog.tick().blue()+' '+'CFG'.abbr().yellow()+' : config updated')});

};

module.exports.readConfig = function (callback){};