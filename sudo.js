// add this to /etc/sudoers to get shudown eithout password prompt
//hitmis ALL=(ALL) NOPASSWD: /sbin/shutdown

var exec = require('child_process').exec;

module.exports.execute = function (command, callback){
    exec(command, function(error, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        if (callback) callback();
    });
};

module.exports.shutdown = function (callback){
    console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - shutdown issued');
    module.exports.execute('sudo shutdown -h now',callback);
};


module.exports.reboot = function (callback){
    module.exports.execute('sudo shutdown -r now',callback);
};

module.exports.ls = function (callback){
    module.exports.execute('ls',callback);
};