var net = require('net');
var dgram = require('dgram');
var udpClient = dgram.createSocket("udp4");
var ipRange = getIpRange(1,254);
udpClient.on('error' ,function(err) {
			console.log('dammit!!!')
});

function getIpRange(min, max){
	var result = [];
	for (var i = min; i <= max; i++){
		result.push(''+i);
	}
	return result;
};


var ANALOG_RANGE_MAX = 254; // 2^8 - 1 - 1 (to enable integer center positions)

// shims
Math.sign = Math.sign || function(value) {
	if(value === 0) return 0;
	return value > 0 ? 1 : -1;
};


var util = {
	toArrayBuffer: function(buffer) {
	    var ab = new ArrayBuffer(buffer.length);
	    var arr = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        arr[i] = buffer[i];
	    }
	    return ab;
	},

	/** In order to normalize analog input and enable a [-0.5, +0.5] input value 
	range for each axis, the raw input values in the full circular area are 
	clipped to be coordinates in the biggest square that fits in the circular area.
	The value computed here describes the relative edge length for this inner square.
	It is a resolved Pythagoras equation where:
	c = 1.0 = circular range diameter = inner rect diagonal length
	a = b

	/2 is applied since we need the size relative to one half of the full range

	TODO Jakob, a math dude should read through the crap I just wrote...
	*/
	normalSquareMaxVal: Math.sqrt(0.5) / 2
};

var Player = function(playerID) {

	var id = playerID;

	var self = this;

	var socket;

	var stickPosRaw = {x: 0, y: 0};
	var stickPosNorm = {x: 0, y: 0};
	var btnStates = [false, false]; // TODO cooler way to store?


	// TODO store as constants!

	var callbacks = {
		'connected': null,
		'disconnected': null,
		'stickPositionChanged': null,
		'stickPositionChangedRaw': null,
		'buttonChanged': null
	};

	this.getID = function() { return id; };

	this.connect = function(playerSocket) {

		socket = playerSocket;

		stickPosRaw.x = stickPosRaw.y = stickPosNorm.x = stickPosNorm.y = 0;
		btnStates = [false, false];

		dispatchEvent('connected');
	}

	this.disconnect = function() {
		socket = null;
		// TODO reset input? to private method?

		dispatchEvent('disconnected');
	}

	this.isConnected = function() {
		return socket != null;
	}

	/** x and y are RAW input values, depicting the position
	in the entire available movement area without any deadzones */
	this.setStickPos = function(x, y) {
		stickPosRaw.x = x;
		stickPosRaw.y = y;

		// TODO wooooaaah... is this the simplest way?
		stickPosNorm.x = (Math.sign(x) * (Math.min(Math.abs(x), util.normalSquareMaxVal) / util.normalSquareMaxVal)) / 2;
		stickPosNorm.y = (Math.sign(y) * (Math.min(Math.abs(y), util.normalSquareMaxVal) / util.normalSquareMaxVal)) / 2;

		dispatchEvent('stickPositionChanged', stickPosNorm);
		dispatchEvent('stickPositionChangedRaw', stickPosRaw);

	}

	// TODO DOC reference is stable during player session - should it also stay constant forever?
	this.getStickPos = function() { return stickPosNorm; };
	this.getStickPosRaw = function() { return stickPosRaw; };

	this.setButtonState = function(btnIx, isDown)  {
		btnStates[btnIx] = isDown;
		dispatchButtonEvent('buttonChanged', btnIx, isDown);
	}

	this.getButtonState = function(btnIx) { return btnStates[btnIx]; }

	this.getSocket = function() { return socket; }


	this.on = function(eventType, callback) {
		callbacks[eventType] = callback;
	}

	function dispatchButtonEvent(type, btnIx, downState) {
		if(callbacks[type])		callbacks[type](self, btnIx, downState);
	}

	function dispatchEvent(type, data) {
		if(callbacks[type])		callbacks[type](self, data);
	}
};

var PlayerRegistry = function() {

	var self = this;

	var players = {
		0: new Player(0),
		1: new Player(1),
		2: new Player(2),
		3: new Player(3)
	};


	this.register = function(playerSocket) {

		var keys = Object.keys(players);

		for(var i=0; i<keys.length; i++) {

			if(!players[keys[i]].isConnected()) {
				players[keys[i]].connect(playerSocket);
				return players[keys[i]];
			}
		}

		return null;
	}

	this.unregister = function(playerSocket) {

		var playerID = self.getPlayerID(playerSocket);
		if(playerID < 0) return false;

		players[playerID].disconnect();
		return true;
	}

	this.getPlayerID = function(playerSocket) {
		var keys = Object.keys(players);

		for(var i=0; i<keys.length; i++) {
			if(players[keys[i]].getSocket() == playerSocket) {
				return keys[i];
			}
		}

		return -1;
	}

	this.getPlayers = function() {
		return players;
	}
}

function PlayerServer() {

	var playerRegistry = new PlayerRegistry();
	var srv = net.createServer(function(socket) {

		//console.log('client connected to server: ' + socket.remoteAddress + ':' + socket.remotePort);

		var player = playerRegistry.register(socket),
			playerID = playerRegistry.getPlayerID(socket);

		socket.write(new Buffer(playerID + '\n'));

		// TODO handle connect/login error


		socket.on('data', onDataReceived);
		socket.on('close', onClose);

		function onDataReceived(data) {
			//console.log('client sent message: ' + socket.remoteAddress + ':' + socket.remotePort);
			//console.log('======= PLAYER ' + playerID + '=======')

			var dataArr = new Uint8Array(util.toArrayBuffer(data));
			if(dataArr[0] < 5) { // action type: button
				player.setButtonState((dataArr[0] - 1), dataArr[1] === 0);
			}else {	// action type: analog input
				player.setStickPos((dataArr[1] / ANALOG_RANGE_MAX) - 0.5, (dataArr[2] / ANALOG_RANGE_MAX) - 0.5);
			}
		}

		function onClose(data) {
			//console.log('client disconnected: ' + socket.remoteAddress + ':' + socket.remotePort);
				
			if(!playerRegistry.unregister(socket)) {
				console.log('connection closed for socket, but was not registered as player!')
			}
		}
	});

	srv.on('error', function(e) {
		console.log('err: ' + e)
	})

	this.listen = function(port, host) {
		srv.listen(port, host);
	}

	this.stop = function() {
		console.log('TODO IMPL stop function')
	}

	this.getPlayers = function() {
		return playerRegistry.getPlayers();
	}
}


// ====== broadcasting server for letting clients detect the console server ======

function BroadcastServer(hostAddr, port, intervalMs, consoleTcpPort) {

	var broadcastAddress = hostAddr.split('.');
	broadcastAddress.pop();

	broadcastAddress.push('255');	
	//broadcastAddress.push('42');	// ATTENTION: debug override since broadcast is not working for Steve


	broadcastAddress = broadcastAddress.join('.');
	
	var msg = 'OPENKONSOLE:' + hostAddr + ':' + '' + consoleTcpPort, msgBuf = new Buffer(msg);

	var timer;

	this.start = function() {
		this.stop();
		timer = setInterval(function() {
			//console.log('BroadcastServer: sending broadcast message to ' + broadcastAddress + ', message: ' + msg);
			udpClient.send(msgBuf, 0, msgBuf.length, port, broadcastAddress, onError);
		}, intervalMs);
	}

	this.stop = function() {
		if(timer) clearInterval(timer);
	}
	
	function onError(err, bytes) {
		if(err) {
			console.log('An error occurred while trying to broadcast. Error and stack trace:');
			console.log(err)
			console.log(err.stack)
		}
	}
}

function IpSniffer(hostAddr, port, intervalMs, consoleTcpPort){
	var timer;
	var msg = 'OPENKONSOLE:' + hostAddr + ':' + '' + consoleTcpPort,
	msgBuf = new Buffer(msg);

	var broadcastAddress = hostAddr.split('.');
	broadcastAddress.pop();
	broadcastAddress = broadcastAddress.join('.') + '.';
	
	function ping(){
		ipRange.map(function(currentValue){
		if(currentValue != 'null'){
		// console.log("UDP Ping sent to: "+broadcastAddress+currentValue);
		udpClient.send(msgBuf, 0, msgBuf.length, port, broadcastAddress + currentValue, function(err){if(err != null){console.log(err);}});
		}
		return currentValue;
		});
	};
	
	this.start = function() {
		this.stop();
		timer = setInterval(function() {
			//console.log('BroadcastServer: sending broadcast message to ' + broadcastAddress + ', message: ' + msg);
			ping();
		}, intervalMs);
	}


	this.stop = function() {
		if(timer) clearInterval(timer);
	}
}


exports.BroadcastServer = BroadcastServer;
exports.PlayerServer = PlayerServer;
exports.IpSniffer = IpSniffer;
