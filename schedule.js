var fs = require('fs');
var tsv = require('tsv');
var clog = require('./clog');

var log;

module.exports.loggingOn = function(){
    log = true;
};

module.exports.loggingOff = function(){
    log = false;
};

module.exports.readSchedule = function(schedulePath,callback){
    fs.readFile(schedulePath, 'utf8', function (err,content) {
        if (err) {
            if(log) console.log(clog.tick().blue()+' '+'SCH'.abbr().green()+' : read failed'.red()+' '+err.toString().red());
        } else {
            if(log) console.log(clog.tick().blue()+' '+'SCH'.abbr().green()+' : read success');
            var schedule = tsv.parse(content);
        }
        if (callback) callback.call(null,err,schedule)
    });
};

module.exports.writeSchedule = function(schedulePath,JSONschedule,callback){
    fs.writeFile(schedulePath, tsv.stringify(JSON.parse(JSONschedule)) , function(err) {
        if (err) {
            if(log) console.log(clog.tick().blue()+' '+'SCH'.abbr().green()+' : write failed'.red()+' '+err.toString().red());
        } else {
            if(log) console.log(clog.tick().blue()+' '+'SCH'.abbr().green()+' : write success');
        }
        if (callback) callback.call(null,err)
    });
};

module.exports.loggingOn(); //logging on by default