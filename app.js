var server = require('http').createServer(handler);
var io = require('socket.io')(server);
var fs = require('fs');
var tsv = require('tsv');
var timer = require('./timer');
var sudo = require('./sudo');

server.listen(3000);

var schedulePath = 'tempschedule';
timer.setio(io);
timer.startTimer(schedulePath);

function handler (request, response) {

    console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[32m'+request.method.substr(0,3)+'\x1b[0m'+' - on url:'+request.url);

    switch (request.url){
        case '/schedule':
            if (request.method == 'GET') {
                fs.readFile(schedulePath, 'utf8', function (err,data) {
                    if (err) {
                        return console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+err);
                    } else {
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
                            console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[32m'+request.method.substr(0,3)+'\x1b[0m'+' - on url:'+request.url+' : schedule update failed');
                            response.end(JSON.stringify({data:'schedule update failed'}));
                            return console.log(err);
                        } else {
                            console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[32m'+request.method.substr(0,3)+'\x1b[0m'+' - on url:'+request.url+' : schedule updated');
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
                    console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[32m'+request.method.substr(0,3)+'\x1b[0m'+' - on url:'+request.url+' : image '+ requestBody);
                    //response.end(JSON.stringify({data:'image'}));
                    fs.readFile(requestBody, function (err,data) {
                        if (err) {
                            return console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+err);
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
                    console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[32m'+request.method.substr(0,3)+'\x1b[0m'+' - on url:'+request.url+' : config updated');
                    response.end(JSON.stringify({data:'config updated'}));
                });
            }
            break;

    }
}

io.on('connection', function (socket) {
    console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - User Connected');

    socket.on('shutdown', function (data) {
        console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - shutdown recieved');
        socket.emit('shutdown-received');
        sudo.shutdown();
    });

    socket.on('reboot', function (data) {
        console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - reboot recieved');
        socket.emit('reboot-received');
        sudo.reboot();
    });

    socket.on('stop-timer', function (data) {
        if (timer.isRunning()) timer.stopTimer();
        console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - stop-timer received');
        socket.emit('timer-stopped')
    });

    socket.on('start-timer', function (data) {
        if (!timer.isRunning()) timer.startTimer(schedulePath);
        console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mSOC\x1b[0m - start-timer received');
        socket.emit('timer-started')
    });
});

