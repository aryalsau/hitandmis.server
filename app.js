var server = require('http').createServer(handler);
var io = require('socket.io')(server);
var fs = require('fs');
var schedule = require('./schedule');
var timer = require('./timer');
var sudo = require('./sudo');
var clog = require('./clog');
var config = require('./config');

server.listen(3000);

console.log(clog.tick().blue()+' '+'APP'.abbr().white()+' : server online on port '+3000);

var configFile = '../camdaemon/config.cfg';
var scheduleFile = 'schedule.sch';
timer.setio(io);
timer.startTimer(scheduleFile);

function handler (request, response) {

    switch (request.url){
        case '/schedule':
            if (request.method == 'GET') {
                schedule.readSchedule(scheduleFile,function(err,scheduleData){
                    if (err) {
                        console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' '+err.toString().red());
                        response.end();
                    } else {
                        console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url);
                        response.end(JSON.stringify(scheduleData));
                    }
                });
            } else if (request.method == 'POST'){
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    schedule.writeSchedule(scheduleFile,requestBody,function(err){
                        if(err) {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : schedule update failed'+' '+err.red());
                            response.end(JSON.stringify({data:'schedule update failed'}));
                        } else {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : schedule updated');
                            response.end(JSON.stringify({data:'schedule updated'}));
                            if (timer.isRunning()) timer.stopTimer();
                            if (!timer.isRunning()) timer.startTimer(scheduleFile);
                        }
                    });
                });
            } else {
                response.end();
            }
            break;

        case '/image':
            if (request.method == 'POST') {
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    fs.readFile(requestBody, function (err,data) {
                        if (err) {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' '+err.toString().red());
                            response.end();
                        } else {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url);
                            response.end(data);
                        }
                    });
                });
            }
            break;

        case '/config':
            if (request.method == 'GET') {
                config.readConfig(configFile,function(err,configData){
                    if (err) {
                        console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+ ' '+ requestBody);
                        response.end();
                    } else {
                        console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+ ' '+ requestBody);
                        response.end(JSON.stringify(configData));
                    }
                });
            } else if (request.method == 'POST') {
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    config.writeConfig(configFile,requestBody,function(err){
                        if(err) {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : config update failed'+' '+err.red());
                            response.end(JSON.stringify({data:'config update failed'}));
                        } else {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : config updated');
                            response.end(JSON.stringify({data:'config updated'}));
                        }
                    });
                });
            } else {
                response.end();
            }
            break;

    }
}

io.on('connection', function (socket) {
    console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : user connected');

    socket.on('shutdown', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : shutdown received');
        sudo.shutdown(function(err){
            if (err){
            } else{
                socket.emit('shutdown-received');
            }
        });
    });

    socket.on('reboot', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : reboot received');
        sudo.reboot(function(err){
            if (err){
            } else{
                socket.emit('reboot-received');
            }
        });
    });

    socket.on('mount', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : mount received');
        sudo.mountDisk(function(err){
            if (err){
                socket.emit('disk-mount-failed');
            } else{
                socket.emit('disk-mounted');
            }
        });
    });

    socket.on('unmount', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : unmount received');
        sudo.unmountDisk(function(err){
            if (err){
                socket.emit('disk-unmount-failed');
            } else{
                socket.emit('disk-unmounted');
            }
        });
    });

    socket.on('sync', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : sync received');
        sudo.setTime(data,function(err){
            if (err){
            } else{
                socket.emit('sync-received');
            }
        });
    });

    socket.on('stop-timer', function (data) {
        if (timer.isRunning()) timer.stopTimer();
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : stop-timer received');
        socket.emit('timer-stopped')
    });

    socket.on('start-timer', function (data) {
        if (!timer.isRunning()) timer.startTimer(scheduleFile);
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : start-timer received');
        socket.emit('timer-started')
    });

    socket.on('disconnect', function() {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : user disconnected');
    })
});

