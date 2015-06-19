var fs = require('fs');
var tsv = require('tsv');
var netSocket = require('net').Socket;
var clog = require('./clog');

var repeater = 0;
var camport = 8000;
var hostip = 'localhost';
var io;

var log;

module.exports.loggingOn = function(){
    log = true;
};

module.exports.loggingOff = function(){
    log = false;
};

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
            if(verbose) console.log(clog.tick().blue()+' '+clog.ticktock().cyan()+' : in window - '+ window.id + ' expTime - ' + window.expTime + '(ms) waitTime - ' + window.waitTime+'(s)');
            captureCallback(window.expTime);
            localPeriod = window.expTime + 1000*window.waitTime;
        } else {
            if(verbose) console.log(clog.tick().blue()+' '+clog.ticktock().cyan()+' : not in a window');
            pulse();
            localPeriod = 5000;
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
            repeater = dynamicRepeat(true,5000,schedule);
        }
    });
}

function stopTimer(){
    repeater.stop();
}

function isRunning(){
    if (repeater){
        return repeater.isRunning();
    } else {
        return repeater;
    }
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
        console.log(clog.tick().blue()+' '+'CAMERA'.abbr().red()+' : capture '+ expTime +' file - ' + socketData)
        io.sockets.emit('image',{file:socketData});
        io.sockets.emit('pulse',{time:clog.tick().substr(1, 8),pulse:'capture'});
    });
}

function pulse(){
    io.sockets.emit('pulse',{time:clog.tick().substr(1, 8),pulse:clog.ticktock()});
}


module.exports.startTimer = startTimer;
module.exports.stopTimer = stopTimer;
module.exports.isRunning = isRunning;

module.exports.loggingOn(); //logging on by default