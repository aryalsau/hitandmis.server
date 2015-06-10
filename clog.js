_reset = "\x1b[0m"
_bright = "\x1b[1m"
_dim = "\x1b[2m"
_underscore = "\x1b[4m"
_blink = "\x1b[5m"
_reverse = "\x1b[7m"
_hidden = "\x1b[8m"

_fgBlack = "\x1b[30m"
_fgRed = "\x1b[31m"
_fgGreen = "\x1b[32m"
_fgYellow = "\x1b[33m"
_fgBlue = "\x1b[34m"
_fgMagenta = "\x1b[35m"
_fgCyan = "\x1b[36m"
_fgWhite = "\x1b[37m"


String.prototype.reset = function(){
    return this+_reset
};

String.prototype.bright = function(){
    return _bright+this.reset()
};

String.prototype.dim = function(){
    return _dim+this.reset()
}

String.prototype.underscore = function(){
    return _underscore+this.reset()
}

String.prototype.blink = function(){
    return _blink+this.reset()
}

String.prototype.reverse = function(){
    return _reverse+this.reset()
}

String.prototype.hidden = function(){
    return _hidden+this.reset()
}


String.prototype.black = function(){
    return _fgBlack+this.reset()
};

String.prototype.red = function(){
    return _fgRed+this.reset()
};

String.prototype.green = function(){
    return _fgGreen+this.reset()
};

String.prototype.yellow = function(){
    return _fgYellow+this.reset()
};

String.prototype.blue = function(){
    return _fgBlue+this.reset()
};

String.prototype.magenta = function(){
    return _fgMagenta+this.reset()
};

String.prototype.cyan = function(){
    return _fgCyan+this.reset()
};

String.prototype.white = function(){
    return _fgWhite+this.reset()
};

String.prototype.blue = function(){
    return _fgBlue+this.reset()
};

String.prototype.abbr = function (){
    return this.substr(0,3);
};

module.exports.tick = function (){
    return '['+new Date().toString().substr(16, 8)+']';
};

module.exports.ticktock = function (text){
    return (module.exports.tick().substr(7, 2)%2?'TIC':'TOK')
};
