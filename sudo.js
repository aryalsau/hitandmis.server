// add this to /etc/sudoers to get shudown eithout password prompt
//hitmis ALL=(ALL) NOPASSWD: /sbin/shutdown, mount, umount, date
var clog = require('./clog');
var exec = require('child_process').exec;

module.exports.execute = function (command, callback){
    exec(command, function(error, stdout, stderr){
        console.log(stdout.green());
        console.log(stderr.red());
        if (callback) callback();
    });
};

module.exports.shutdown = function (callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : shutdown issued');
    module.exports.execute('sudo shutdown -h now',callback);
};


module.exports.reboot = function (callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : reboot issued');
    module.exports.execute('sudo shutdown -r now',callback);
};

module.exports.mountDisk = function (successCallback,failCallbac){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : mount issued');
    exec('sudo mount /dev/sdb1 /media/usbdrive', function(error, stdout, stderr){
        //console.log(stdout.green());
        //console.log(stderr.red());
        if (stderr){
            if (failCallbac) failCallbac();
        } else {
            if (successCallback) successCallback();
        }
    });
};

module.exports.unmountDisk = function (successCallback,failCallbac){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : umount issued');
    exec('sudo umount /dev/sdb1 -l', function(error, stdout, stderr){
        //console.log(stdout.green());
        //console.log(stderr.red());
        if (stderr){
            if (failCallbac) failCallbac();
        } else {
            if (successCallback) successCallback();
        }
    });
};


module.exports.setTime = function (time, callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : system time set to ' + time);
    module.exports.execute('sudo date +%Y-%m-%d" "%H:%M:%S -s "'+time+'"',callback);
};

module.exports.ls = function (callback){
    module.exports.execute('ls',callback);
};