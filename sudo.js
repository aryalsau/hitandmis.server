// add this to /etc/sudoers to get shudown eithout password prompt
//hitmis ALL=(ALL) NOPASSWD: /sbin/shutdown, mount, umount, date
var clog = require('./clog');
var exec = require('child_process').exec;

var log;

module.exports.loggingOn = function(){
    log = true;
};

module.exports.loggingOff = function(){
    log = false;
};

module.exports.shutdown = function (callback){
    exec('sudo shutdown -h now', function(err, stdout, stderr){
        if (err){
            if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : shutdown failed'.red()+' '+err.toString().red());
            if (callback) callback.call(true)
        } else { if (stderr){
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : shutdown failed'.red()+' '+stderr.toString().red());
                    if (callback) callback.call(true)
                } else {
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : shutdown success');
                }
        }
        if (callback) callback.call(null,err, stdout, stderr)
    });
};

module.exports.reboot = function (callback){
    exec('sudo shutdown -r now', function(err, stdout, stderr){
        if (err){
            if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : reboot failed'.red()+' '+err.toString().red());
            if (callback) callback.call(true);
        } else { if (stderr){
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : reboot failed'.red()+' '+stderr.toString().red());
                    if (callback) callback.call(true);
                } else {
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : reboot success');
                    if (callback) callback.call(false);
                }
        }
        if (callback) callback.call(null,err, stdout, stderr)
    });
};

module.exports.mountDisk = function (callback){
    exec('sudo mount /dev/sdb1 /media/usbdrive', function(err, stdout, stderr){
        if (err){
            if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : mount failed'.red()+' '+err.toString().red());
            if (callback) callback.call(true);
        } else { if (stderr){
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : mount failed'.red()+' '+stderr.toString().red());
                    if (callback) callback.call(true);
                } else {
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : mount success');
                    if (callback) callback.call(false);
                }
        }
        if (callback) callback.call(null,err, stdout, stderr)
    });
};

module.exports.unmountDisk = function (callback){
    exec('sudo umount /dev/sdb1 -l', function(err, stdout, stderr){
        if (err){
            if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : unmount failed'.red()+' '+err.toString().red());
            if (callback) callback.call(true);
        } else { if (stderr){
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : unmount failed'.red()+' '+stderr.toString().red());
                    if (callback) callback.call(true);
                } else {
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : unmount success');
                    if (callback) callback.call(false);
                }
        }
        if (callback) callback.call(null,err, stdout, stderr)
    });
};

module.exports.setTime = function (timeStamp, callback){
    exec('sudo date +%Y-%m-%d" "%H:%M:%S -s "'+timeStamp.time+'"', function(err, stdout, stderr){
        if (err){
            if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : set time failed'.red()+' '+err.toString().red());
            if (callback) callback.call(true);
        } else { if (stderr){
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : set time failed'.red()+' '+stderr.toString().red());
                    if (callback) callback.call(true);
                } else {
                    if(log) console.log(clog.tick().blue()+' '+'SUD'.abbr().yellow()+' : set time success '+timeStamp.time);
                    if (callback) callback.call(false);
                }
        }
    });

};

module.exports.loggingOn(); //logging on by default
