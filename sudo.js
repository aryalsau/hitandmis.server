// add this to /etc/sudoers to get shudown eithout password prompt
//hitmis ALL=(ALL) NOPASSWD: /sbin/shutdown, mount, umount, date
//var colorlog = require('./logging');
var winston = require('winston');
var exec = require('child_process').exec;

module.exports.shutdown = function (callback){
	exec('sudo shutdown -h now', function(err, stdout, stderr){
		if (err){
			winston.info('shutdown failed : '+err.toString());
			if (callback) callback.call(true)
		} else {
			if (stderr){
				winston.info('shutdown failed : '+stderr.toString());
				if (callback) callback.call(true)
			} else {
				winston.info('shutdown success');
			}
		}
		if (callback) callback.call(null,err, stdout, stderr)
	});
};

module.exports.reboot = function (callback){
	exec('sudo shutdown -r now', function(err, stdout, stderr){
		if (err){
			winston.info('reboot failed : '+err.toString());
			if (callback) callback.call(true);
		} else {
			if (stderr){
				winston.info('reboot failed : '+stderr.toString());
				if (callback) callback.call(true);
			} else {
				winston.info('reboot success');
				if (callback) callback.call(false);
			}
		}
		if (callback) callback.call(null,err, stdout, stderr)
	});
};

module.exports.mountDisk = function (callback){
	exec('sudo mount /dev/sdb1 /media/usbdrive', function(err, stdout, stderr){
		if (err){
			winston.info('mount failed : '+err.toString());
			if (callback) callback.call(true);
		} else {
			if (stderr){
				winston.info('mount failed : '+stderr.toString());
				if (callback) callback.call(true);
			} else {
				winston.info('mount success');
				if (callback) callback.call(false);
			}
		}
		if (callback) callback.call(null,err, stdout, stderr)
	});
};

module.exports.unmountDisk = function (callback){
	exec('sudo umount /dev/sdb1 -l', function(err, stdout, stderr){
		if (err){
			winston.info('unmount failed : '+err.toString());
			if (callback) callback.call(true);
		} else {
			if (stderr){
				winston.info('unmount failed : '+stderr.toString());
				if (callback) callback.call(true);
			} else {
				winston.info('unmount success');
				if (callback) callback.call(false);
			}
		}
		if (callback) callback.call(null,err, stdout, stderr)
	});
};

module.exports.setTime = function (timeStamp, callback){
	exec('sudo date +%Y-%m-%d" "%H:%M:%S -s "'+timeStamp.time+'"', function(err, stdout, stderr){
		if (err){
			winston.info('set time failed : '+err.toString());
			if (callback) callback.call(true);
		} else {
			if (stderr){
				winston.info('set time failed : '+stderr.toString());
				if (callback) callback.call(true);
			} else {
				winston.info('set time success');
				if (callback) callback.call(false);
			}
		}
	});
};