var winston = require('winston');
winston.remove(winston.transports.Console)
	.add(winston.transports.File, {filename:'server.log'})
	.add(winston.transports.Console, {'timestamp':true,colorize: true});
var WebSocketServer = require('ws').Server;
var socketServer = new WebSocketServer({port: 3000});
var timer = require('./timer');
var config = require('./config');
var queue = require('./queue');

socketServer.broadcast = function broadcast(data) {
	socketServer.clients.forEach(function each(client) {
		client.send(data, function ack(error) {
			if (typeof error === 'undefined') {
			} else {
				console.log(error);
				socketServer.close();
			}
		});
	});
};

socketServer.on('connection', function(socket) {
	var clientip = socket.upgradeReq.connection.remoteAddress;
	winston.info('client on '+clientip+' connected');
	socket.on('close', function() {
		winston.info('client on '+clientip+' disconnected');
	}).on('message', function(messageString) {
		var socketMessage = JSON.parse(messageString);
		switch(socketMessage.event){
			case 'shutdown':
				winston.info('shutdown');
				break;
			case 'reboot':
				winston.info('reboot');
				break;
			case 'mount':
				winston.info('mount');
				break;
			case 'unmount':
				winston.info('unmount');
				break;
			case 'clocksync':
				winston.info('clocksync');
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
				winston.info('get-config');
				break;
			case 'set-config':
				winston.info('set-config');
				config.write('config.cfg', socketMessage.data, function(){
					socket.send('config received and set');
				});
				break;
			case 'get-schedule':
				winston.info('get-schedule');
				break;
			case 'set-schedule':
				winston.info('set-schedule');
				queue.write('schedule.sch', socketMessage.data, function() {
					socket.send('schedule received and set');
				});
				break;
			case 'start-timer':
				winston.info('start-timer');
				if (!timer.isRunning()) timer.startTimer('schedule.sch',socketServer);
				break;
			case 'stop-timer':
				winston.info('stop-timer');
				if (timer.isRunning()) timer.stopTimer(socketServer);
				break;
			case 'quick-capture':
				winston.info('quick-capture');
				timer.capture(1000, socketServer);
				//if (!timer.isRunning())
				break;
			default:
				winston.info('['+socketMessage.event + '] received with ['+socketMessage.data+']');
				break;
		}
	});
});