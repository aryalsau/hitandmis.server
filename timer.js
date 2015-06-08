var fs = require('fs');
var tsv = require('tsv');
var netSocket = require('net').Socket;

var stopVariable;
var camport = 8000;
var hostip = 'localhost';
var io;

module.exports.setio = function(mainIO){
    io = mainIO;
};

function isInWindow(window){
    var now = new Date();
    return (new Date(window.start) < now && now < new Date(window.end));
}

function isInSomeWindow(windows){
    for (var i = 0; i < windows.length; i++) {
        if(isInWindow(windows[i])){
            return windows[i];
            break;
        }
    }
    return false;
}


function dynamicRepeat(verbose,period,windowList) {
    var timerVariable = 0;
    var localPeriod = period;
    function run(verbose) {
        window = isInSomeWindow(windowList);
        if (window){
            if(verbose) console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[36mTIC\x1b[0m - in window:'+ window.id + ' expTime:' + window.expTime + '(ms) waitTime:' + window.waitTime+'(s)');
            captureCallback(window.expTime);
            localPeriod = window.expTime + 1000*window.waitTime;
        } else {
            if(verbose) console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[36mTOK\x1b[0m - not in a window');
            localPeriod = 1000;
        }
        timerVariable = setTimeout(function(){run(verbose)}, localPeriod);
    }
    timerVariable = setTimeout(function(){run(verbose)}, localPeriod);

    function stop() {
        if (timerVariable) {
            clearTimeout(timerVariable);
            timerVariable = 0;
        }
    }

    function isRunning(){
        return (timerVariable) ? true : false;
    }
    return {stop:stop, isRunning:isRunning};
}


function startTimer(schedulePath) {
    fs.readFile(schedulePath, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        } else {
            var schedule = tsv.parse(data);
            stopVariable = dynamicRepeat(true,1000,schedule);
        }
    });
}

function stopTimer(){
    stopVariable.stop();
}

function isRunning(){
    return stopVariable.isRunning();
}


function captureCallback(expTime){
    client = new netSocket();
    client.setEncoding('binary');
    socketData = '';
    client.connect(camport, hostip, function() {
        client.write('capture '+expTime);
    });
    client.on('data', function(chunk) {
        socketData += chunk;
        client.end();
    });
    client.on('end', function() {
        client.destroy()
    });
    client.on('close', function() {
        console.log('\x1b[35m['+(new Date().toString().substr(16, 8))+']\x1b[0m '+'\x1b[31mCAM\x1b[0m - capture '+ expTime +' : '+ socketData);
        io.sockets.emit('image',{file:socketData});
    });
}


module.exports.startTimer = startTimer;
module.exports.stopTimer = stopTimer;
module.exports.isRunning = isRunning;
