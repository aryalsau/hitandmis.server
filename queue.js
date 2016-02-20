var fs = require('fs');
var tsv = require('tsv');
var moment = require('moment');
var colorlog = require('./logging');

var log;

module.exports.loggingOn = function(){
	log = true;
};

module.exports.loggingOff = function(){
	log = false;
};


var Sequence = function (json) {
	//json = {
	//	id: 6,
	//	start: "2016-01-08T20:38:00.000Z",
	//	end: "2016-01-08T20:38:30.000Z",
	//	expTime: 500,
	//	waitTime: 1,
	//	comment:'string comment'
	//};
	this.id = json.id;
	this.start = moment(json.start);
	this.end = moment(json.end);
	//this.duration = moment.duration(moment(this.end).diff(moment(this.start)));
	this.updateDuration = function(){
		this.duration = moment.duration(moment(this.end).diff(moment(this.start)));
	};
	this.expTime = json.expTime;
	this.waitTime = json.waitTime;
	this.comment = json.comment;
	this.updateDuration();
	this.simplify = function(){
		return {
			id: this.id,
			start: this.start.format("YYYY-MM-DDTHH:mm:ss.SSS"),
			end: this.end.format("YYYY-MM-DDTHH:mm:ss.SSS"),
			duration: Math.round(this.duration.asHours())+':'+this.duration.minutes()+':'+this.duration.seconds()+'.'+this.duration.milliseconds(),
			expTime: this.expTime,
			waitTime: this.waitTime,
			comment: this.comment
		}
	};
	this.isInWindow = function(){
		var now = moment();
		return (this.start.isBefore(now) && this.end.isAfter(now));
	};
	this.timeToWindow = function(){
		var now = moment();
		return moment.duration(this.start.diff(now));
		//return duration.hours()+':'+duration.minutes()+':'+duration.seconds()
	};
	return {
		id: this.id,
		start: this.start,
		end: this.end,
		duration: this.duration,
		expTime: this.expTime,
		waitTime: this.waitTime,
		comment: this.comment,
		updateDuration: this.updateDuration,
		simplify: this.simplify,
		isInWindow: this.isInWindow,
		timeToWindow: this.timeToWindow
	};
};

var order = function (sequenceA,sequanceB) {
	if (sequenceA.start.isBefore(sequanceB.start))
		return -1;
	else if (sequenceA.start.isAfter(sequanceB.start))
		return 1;
	else
		return 0;
};

module.exports.isInWindow = function(windows) {
	for (var i = 0; i < windows.length; i++) {
		if(windows[i].isInWindow()) {
			return windows[i];
		}
	}
	return false;
};

module.exports.isNextWindow = function(windows) {
	var temp = windows[windows.length-1];
	for (var i = 0; i < windows.length; i++) {
		if (windows[i].timeToWindow().asMilliseconds()<0) {
			continue;
		} else {
			temp = (windows[i].timeToWindow().asMilliseconds()<temp.timeToWindow().asMilliseconds())?windows[i]:temp;
		}
	}
	return (temp.timeToWindow().asMilliseconds()>0)?temp:false;
};

module.exports.read = function(schedulePath, callback, sequances){
	callback.bind(schedulePath, sequances);
	fs.readFile(schedulePath, 'utf8', function (err, content) {
		if (err) {
			if(log) console.log(colorlog.tick().blue()+' '+'SCH'.abbr().blue()+' : read failed'.red()+' '+err.toString().red());
		} else {
			if(log) console.log(colorlog.tick().blue()+' '+'SCH'.abbr().blue()+' : read success');
			var s, scheduleArray = tsv.parse(content);
			sequances = scheduleArray.map(function(window){return Sequence(window)}).sort(order);
			callback(sequances);
		}
	});
};

module.exports.readSync = function(schedulePath){
	return tsv.parse(fs.readFileSync(schedulePath, 'utf8')).map(function(item){return Sequence(item)}).sort(order);
};

module.exports.write = function(schedulePath,JSONschedule, callback){
	fs.writeFile(schedulePath, tsv.stringify(JSON.parse(JSONschedule)) , function(err) {
		if (err) {
			if(log) console.log(colorlog.tick().blue()+' '+'SCH'.abbr().blue()+' : write failed'.red()+' '+err.toString().red());
		} else {
			if(log) console.log(colorlog.tick().blue()+' '+'SCH'.abbr().blue()+' : write success');
			if (callback) callback();
		}
	});
};

module.exports.writeSync = function(schedulePath,JSONschedule){
	fs.writeFileSync(schedulePath,tsv.stringify(JSON.parse(JSONschedule)))
};

module.exports.loggingOn(); //logging on by default

