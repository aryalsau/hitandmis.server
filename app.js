var server = require('http').createServer(handler);
var io = require('socket.io')(server);
var fs = require('fs');
var tsv = require('tsv');
var timer = require('./timer');
var sudo = require('./sudo');
var clog = require('./clog');

server.listen(3000);

var schedulePath = 'tempschedule';
timer.setio(io);
timer.startTimer(schedulePath);

function handler (request, response) {

    switch (request.url){
        case '/schedule':
            if (request.method == 'GET') {
                fs.readFile(schedulePath, 'utf8', function (err,data) {
                    if (err) {
                        return console.log(clog.tick().blue()+' '+err);
                    } else {
                        console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url);
                        schedule = tsv.parse(data);
                        response.end(JSON.stringify(schedule));
                    }
                });
            } else if (request.method == 'POST'){
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    fs.writeFile(schedulePath, tsv.stringify(JSON.parse(requestBody)) , function(err) {
                        if(err) {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : schedule update failed');
                            response.end(JSON.stringify({data:'schedule update failed'}));
                            return console.log(err);
                        } else {
                            console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : schedule updated');
                            response.end(JSON.stringify({data:'schedule updated'}));
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
                    console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : image '+ requestBody);
                    fs.readFile(requestBody, function (err,data) {
                        if (err) {
                            return console.log(clog.tick().blue()+' '+err);
                        } else {
                            response.end(data);
                        }
                    });
                });
            }
            break;

        case '/config':
            if (request.method == 'POST') {
                var requestBody = '';
                request.on('data', function (chunk) {
                    requestBody += chunk;
                });
                request.on('end', function () {
                    //console.log(JSON.parse(requestBody));
                    //TODO - write the configuration to disk on the server
                    console.log(clog.tick().blue()+' '+request.method.abbr().green()+' : on url '+request.url+' : config updated');
                    response.end(JSON.stringify({data:'config updated'}));
                });
            }
            break;

    }
}

io.on('connection', function (socket) {
    console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : User Connected');

    socket.on('shutdown', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : shutdown received');
        socket.emit('shutdown-received');
        sudo.shutdown();
    });

    socket.on('reboot', function (data) {
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : reboot received');
        socket.emit('reboot-received');
        sudo.reboot();
    });

    socket.on('stop-timer', function (data) {
        if (timer.isRunning()) timer.stopTimer();
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : stop-timer received');
        socket.emit('timer-stopped')
    });

    socket.on('start-timer', function (data) {
        if (!timer.isRunning()) timer.startTimer(schedulePath);
        console.log(clog.tick().blue()+' '+'SOCKET'.abbr().magenta()+' : start-timer received');
        socket.emit('timer-started')
    });
});

