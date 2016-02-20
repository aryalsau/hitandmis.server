var fs = require('fs');
var tsv = require('tsv');
var moment = require('moment');
var colorlog = require('./logging');
var queue = require('./queue');
var netSocket = require('net').Socket;

var repeater = 0;
var camport = 8000;
var hostip = '129.63.134.232';
var io;

captureCallback = function(expTime){
	var client = new netSocket();
	client.setEncoding('binary');
	client.setTimeout(0,function(){
		client.destroy();
	});
	var socketData = '';
	client.connect(camport, hostip, function() {
		client.write('capture '+expTime);
	});
	client.on('data', function(chunk) {
		socketData += chunk;
		client.end();
	});
	client.on('end', function() {
		console.log(colorlog.tick().blue()+' '+'CAMERA'.abbr().red()+' : capture '+ expTime +' file - ' + socketData);
		io.sockets.emit('image',{file:socketData});
		io.sockets.emit('pulse',{time:colorlog.tick().substr(1, 8),pulse:'capture'});
		client.destroy();
	});
	client.on('close', function() {
	});
	client.on('error', function(err) {
		console.log(colorlog.tick().blue()+' '+'CAMERA'.abbr().red()+' : capture '+ expTime +' error connecting'.red() + ' ' + err.toString().red());
		client.destroy();
	});
};


var repeater;

var verbose = true;

dynamicRepeat = function(period,scheduleFile,socketServer) {
	var timerId = 0;
	var localPeriod = period;
	var windowList;
	var thisWindow;
	var nextWindow;
	var run = function() {
		windowList = queue.readSync(scheduleFile);
		thisWindow = queue.isInWindow(windowList);
		if (thisWindow) {
			//if(verbose) console.log(colorlog.tick().blue()+' : in window - '+ window.id + ' : expTime - ' + window.expTime + '(ms) : waitTime - ' + window.waitTime+'(s)');
			captureCallback(thisWindow);
			localPeriod = parseInt(thisWindow.expTime) + 1000*(parseInt(thisWindow.waitTime));
			socketServer.broadcast(JSON.stringify({
				next:{
					item:'Next Image in',
					t:localPeriod
				},
				timer:{isRunning:isRunning()}
			}));
		} else {
			nextWindow = queue.isNextWindow(windowList);
			if (nextWindow) {
				if(verbose) console.log(colorlog.tick().blue()+' TIMER'.magenta()+' : not in a window : next window in '+nextWindow.timeToWindow().asSeconds()+' s');
				localPeriod = 1000;
				socketServer.broadcast(JSON.stringify({
					next:{
						item:'Next Window in',
						t:nextWindow.timeToWindow().asMilliseconds()
					},
					timer:{isRunning:isRunning()}
				}));
			} else {
				if(verbose) console.log(colorlog.tick().blue()+' TIMER'.magenta()+' : no more windows');
				localPeriod = 1000;
				socketServer.broadcast(JSON.stringify({
					next:{
						item:'No windows',
						t:0
					},
					timer:{isRunning:isRunning()}
				}));
			}
		}
		timerId = setTimeout(function(){run()}, localPeriod);
	};
	timerId = setTimeout(function(){run()}, localPeriod);

	var stop = function() {
		if (isRunning()) {
			clearTimeout(timerId);
		}
	};

	var isRunning = function(){
		return (((timerId === null)?-1:timerId._idleTimeout)<0)?false:true;
	};

	return {stop:stop, isRunning:isRunning};
};


module.exports.startTimer = function(scheduleFile,socketServer) {
	console.log(colorlog.tick().blue()+' TIMER'.red()+' : start');
	repeater = dynamicRepeat(1000,scheduleFile,socketServer);
};

module.exports.stopTimer = function(socketServer){
	console.log(colorlog.tick().blue()+' TIMER'.red()+' : stop');
	repeater.stop();
	socketServer.broadcast(JSON.stringify({
		timer:{isRunning:repeater.isRunning()}
	}));
};

module.exports.isRunning = function(){
	return (repeater)?repeater.isRunning():false;
};

module.exports.restart = function(){
	if (repeater){
		return repeater.isRunning();
	} else {
		return repeater;
	}
};

module.exports.capture = captureCallback;

//captureCallback = function(window){
//	console.log(colorlog.tick().blue()+' CAPTURE'.magenta()+' : in window - '+ window.id + ' : expTime - ' + window.expTime + '(ms) : waitTime - ' + window.waitTime+'(s)');
//};
