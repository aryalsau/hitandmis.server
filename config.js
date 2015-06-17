var fs = require('fs');
var clog = require('./clog');



module.exports.writeConfig = function (configData,callback){
    fs.writeFile(configFile, 'CAMDAEMON_SITE='+configData.site+'\n'+
                             'CAMDAEMON_CAM='+configData.camera+'\n'+
                             'CAMDAEMON_PATH='+configData.path, function(){
        callback();
        console.log(clog.tick().blue()+' '+'CFG'.abbr().yellow()+' : config updated')});
};

module.exports.readConfig = function (callback){
    var content = fs.readFileSync(configFile,'utf-8');
    var tempArray1 = content.split('\n');
    for (var i=0; i<tempArray1.length; i++) {
        var tempArray2 = tempArray1[i].split('=');
        switch (tempArray2[0]) {
            case 'CAMDAEMON_SITE':
                var siteVar = tempArray2[1];
                break;
            case 'CAMDAEMON_CAM':
                var camVar = tempArray2[1];
                break;
            case 'CAMDAEMON_PATH':
                var pathVar = tempArray2[1];
                break;
        }
    }
    return {path:pathVar, cam:camVar, site:siteVar}
};