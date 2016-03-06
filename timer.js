var fs = require('fs');
var winston = require('winston');
var tsv = require('tsv');
var moment = require('moment');
var queue = require('./queue');
var netSocket = require('net').Socket;

var camport = 3000;
var hostip = '127.0.0.1';

var captureCallback = function(window, socketServer){
	var client = new netSocket();
	client.setEncoding('binary');
	client.setTimeout(0,function(){
		client.destroy();
	});
	var socketData = '';
	client.connect(camport, hostip, function() {
		client.write('capture '+window.expTime);
	});
	client.on('data', function(chunk) {
		socketData += chunk;
		client.end();
	});
	client.on('end', function() {
		winston.info('capture : '+ window.expTime +' ms file - ' + socketData);
		socketServer.broadcast(JSON.stringify({
			file:{
				name:socketData
			}}));
		client.destroy();
	});
	client.on('close', function() {
	});
	client.on('error', function(err) {
		winston.error('capture '+ window.expTime +' error connecting' + ' ' + err.toString());
		client.destroy();
	});
};


var repeater;

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
			captureCallback(thisWindow, socketServer);
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
				winston.info('not in a window, next window in '+nextWindow.timeToWindow().asSeconds()+' s');
				localPeriod = 1000;
				socketServer.broadcast(JSON.stringify({
					next:{
						item:'Next Window in',
						t:nextWindow.timeToWindow().asMilliseconds()
					},
					timer:{isRunning:isRunning()}
				}));
			} else {
				winston.info('no more windows');
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
	winston.info('timer start');
	repeater = dynamicRepeat(1000,scheduleFile,socketServer);
};

module.exports.stopTimer = function(socketServer){
	winston.info('timer stop');
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
