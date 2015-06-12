// add this to /etc/sudoers to get shudown eithout password prompt
//hitmis ALL=(ALL) NOPASSWD: /sbin/shutdown, mount, umount, date
var clog = require('./clog');
var exec = require('child_process').exec;

module.exports.execute = function (command, callback){
    exec(command, function(error, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
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

module.exports.mountDisk = function (callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : mount issued');
    module.exports.execute('sudo mount /dev/sdb1 /media/usbdrive',callback);
};

module.exports.unmountDisk = function (callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : umount issued');
    module.exports.execute('sudo umount /dev/sdb1 -l',callback);
};

module.exports.setTime = function (time, callback){
    console.log(clog.tick().blue()+' '+'SUDO'.abbr().yellow()+' : system time set to ' + time);
    module.exports.execute('sudo date +%Y-%m-%d" "%H:%M:%S -s "'+time+'"',callback);
};

module.exports.ls = function (callback){
    module.exports.execute('ls',callback);
};