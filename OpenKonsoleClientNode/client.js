var net = require('net');

var HOST = '192.168.178.56';
var PORT = 1337;

var ANALOG_RANGE_MAX = 254; // 2^8 - 1 -1

var BTN_CTRL_IDS = {
	'START': 0,
	'A': 1,
	'B': 2,
	'C': 3,
	'D': 4
}
var STICK_CTRL_ID = 5;


function Client(cb) {
	var client = new net.Socket();

	client.on('close', function() {
		log('Connection closed');
	});

	client.on('data', function(data) {
		cb(data);
	});

	this.connect = function() {
		client.connect(PORT, HOST, function() {
			log('connected to OK server: ' + HOST + ':' + PORT);
		});
	}

	this.disconnect = function() {
		log('disconnected from OK server');
		client.destroy();
	}

	this.sendStick = function(x, y) {
		var byteX = stickPos2Byte(x),
			byteY = stickPos2Byte(y);
		var byteArr = [STICK_CTRL_ID, byteX, byteY];

		client.write(new Buffer(byteArr));
	}

	this.sendButton = function(btn, down) {
		var byteArr = [BTN_CTRL_IDS[btn], down ? 0 : 1];
		client.write(new Buffer(byteArr));
	}
}

function stickPos2Byte(pos) {
	return Math.floor(ANALOG_RANGE_MAX * (pos + 0.5));
}

function log(msg) {
	process.stdout.write('' + msg + '\n')
}

module.exports.Client = Client;