var winston = require('winston');
winston.remove(winston.transports.Console)
	.add(winston.transports.File, {filename:'server.log'})
	.add(winston.transports.Console, {'timestamp':true, colorize:true});
var WebSocketServer = require('ws').Server;
var http = require('http');
var fs = require("fs");
var timer = require('./timer');
var config = require('./config');
var queue = require('./queue');

var port = 3600;

var httpServer = http.createServer(function(request, response) {
	//var configuration = config.readSync('config.cfg');

	var filename = '../camdaemon'+request.url;

	winston.info('http request for '+filename+' received');

	fs.stat(filename, function(err, stat) {
		if(err == null) {
			fs.readFile(filename, "binary", function(err, file) {
				if(err) {
					winston.info('fs.readFile error in reading '+filename+' received');
					response.end();
					return;
				}
				//response.writeHead(200);
				response.write(file, "binary");
				response.end();
				winston.info(filename+' served');
			});
		} else {
			winston.info('fs.stat error in retrieving '+filename+' received');
			response.end();
			return;
		}
	});

});

var webSocketServer = new WebSocketServer({
	server: httpServer,
	autoAcceptConnections: false
});

httpServer.listen( port, function() {
	winston.info('hit&mis server starting...');
	winston.info('listening to ' + 'localhost' + ':' + port + '...');
	if (!timer.isRunning()) timer.startTimer('schedule.sch',webSocketServer);
});

webSocketServer.broadcast = function broadcast(data) {
	webSocketServer.clients.forEach(function each(client) {
		client.send(data, function ack(error) {
			if (typeof error === 'undefined') {
			} else {
				console.log(error);
				webSocketServer.close();
			}
		});
	});
};

webSocketServer.on('connection', function(socket) {
	var clientip = socket.upgradeReq.connection.remoteAddress;
	winston.info('client on '+clientip+' connected');
	socket.on('close', function() {
		winston.info('client on '+clientip+' disconnected');
	}).on('message', function(messageString) {
		var socketMessage = JSON.parse(messageString);
		switch(socketMessage.event){
			case 'shutdown':
				winston.info('shutdown received');
				break;
			case 'reboot':
				winston.info('reboot received');
				break;
			case 'mount':
				winston.info('mount received');
				break;
			case 'unmount':
				winston.info('unmount received');
				break;
			case 'clocksync':
				winston.info('clocksync received');
				break;
			case 'synchronize':
				winston.info('synchronize with client on '+clientip);
				windows = queue.readSync('schedule.sch');
				configuration = config.readSync('config.cfg');
				socket.send(JSON.stringify({
					schedule:windows.map(function(window){return window.simplify()}),
					config:configuration,
					timer:{isRunning:timer.isRunning()}
				}));
				break;
			case 'get-config':
				winston.info('get-config received');
				break;
			case 'set-config':
				winston.info('set-config received');
				config.write('config.cfg', socketMessage.data, function(){
					socket.send('config received and set');
				});
				break;
			case 'get-schedule':
				winston.info('get-schedule received');
				break;
			case 'set-schedule':
				winston.info('set-schedule received');
				queue.write('schedule.sch', socketMessage.data, function() {
					socket.send('schedule received and set');
				});
				break;
			case 'start-timer':
				winston.info('start-timer received');
				if (!timer.isRunning()) timer.startTimer('schedule.sch',webSocketServer);
				break;
			case 'stop-timer':
				winston.info('stop-timer received');
				if (timer.isRunning()) timer.stopTimer(webSocketServer);
				break;
			case 'quick-capture':
				winston.info('quick-capture received');
				timer.capture({expTime:socketMessage.data.expTime, xBin:1, yBin:1}, webSocketServer);
				//if (!timer.isRunning())
				break;
			default:
				winston.info('['+socketMessage.event + '] received with ['+socketMessage.data+']');
				break;
		}
	});
});
