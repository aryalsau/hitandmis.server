var WebSocketServer = require('ws').Server;
var socketServer = new WebSocketServer({port: 3000});
var logging = require('./logging');
var config = require('./config');
var queue = require('./queue');
var timer = require('./timer');

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
	console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : client on '+clientip.magenta()+' connected');
	socket.on('close', function() {
			console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : client on '+clientip.magenta()+' disconnected');
	})
		.on('message', function(messageString) {
			var socketMessage = JSON.parse(messageString);
			switch(socketMessage.event){
				case 'shutdown':
					console.log('shutdown event received');
					break;
				case 'reboot':
					console.log('reboot event received');
					break;
				case 'mount':
					console.log('mount event received');
					break;
				case 'unmount':
					console.log('unmount event received');
					break;
				case 'clocksync':
					console.log('clocksync event received');
					break;
				case 'synchronize':
					console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : synchronize with client on '+clientip.magenta());
					windows = queue.readSync('schedule.sch');
					configuration = config.readSync('config.cfg');
					socket.send(JSON.stringify({
						schedule:windows.map(function(window){return window.simplify()}),
						config:configuration,
						timer:{isRunning:timer.isRunning()}
					}));
					break;
				case 'get-config':
					break;
				case 'set-config':
					config.write('config.cfg', socketMessage.data, function(){
						socket.send('config received and set');
					});
					break;
				case 'get-schedule':
					break;
				case 'set-schedule':
					console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : set-schedule received');
					queue.write('schedule.sch', socketMessage.data, function() {
						socket.send('schedule received and set');
					});
					break;
				case 'start-timer':
					console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : start timer');
					if (!timer.isRunning()) timer.startTimer('schedule.sch',socketServer);
					break;
				case 'stop-timer':
					console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : stop timer');
					if (timer.isRunning()) timer.stopTimer(socketServer);
					break;
				case 'quick-capture':
					console.log(logging.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : quick capture');
					timer.capture(1000);
					//if (!timer.isRunning())
					break;
				default:
					console.log('event: ['+socketMessage.event+'] received with data: ['+socketMessage.data+']');
					break;
			}
		});
});