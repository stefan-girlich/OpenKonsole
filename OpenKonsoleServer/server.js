var net = require('net');
var dgram = require('dgram');


var ANALOG_RANGE_MAX = 254; // 2^8 - 1 - 1 (to enable integer center positions)


var util = {
	toArrayBuffer: function(buffer) {
	    var ab = new ArrayBuffer(buffer.length);
	    var arr = new Uint8Array(ab);
	    for (var i = 0; i < buffer.length; ++i) {
	        arr[i] = buffer[i];
	    }
	    return ab;
	}
};

var PlayerRegistry = function() {

	var self = this;

	var players = {
		0: null,
		1: null,
		2: null,
		3: null
	};

	this.register = function(playerSocket) {

		var keys = Object.keys(players);

		for(var i=0; i<keys.length; i++) {

			if(players[keys[i]] == null) {

				players[keys[i]] = playerSocket;
				return keys[i];
			}
		}

		return -1;
	}

	this.unregister = function(playerSocket) {

		var playerID = self.getID(playerSocket);
		if(playerID < 0) return false;

		players[playerID] = null;
		return true;
	}

	this.getID = function(playerSocket) {
		var keys = Object.keys(players);

		for(var i=0; i<keys.length; i++) {
			if(players[keys[i]] == playerSocket) {
				return keys[i];
			}
		}

		return -1;
	}
}

function PlayerServer() {

	var playerRegistry = new PlayerRegistry();
	var srv = net.createServer(function(socket) {

		console.log('client connected to server: ' + socket.remoteAddress + ':' + socket.remotePort);

		var playerID = playerRegistry.register(socket);

		console.log('player connected with playerID: ' + playerID)
		socket.write(new Buffer(playerID + '\n'));

		// TODO handle connect/login error


		socket.on('data', onDataReceived);

		socket.on('close', onClose);

		function onDataReceived(data) {
			//console.log('client sent message: ' + socket.remoteAddress + ':' + socket.remotePort);

			console.log('======= PLAYER ' + playerID + '=======')

			var dataArr = new Uint8Array(util.toArrayBuffer(data));

			if(dataArr[0] < 5) { // action type: button

				if(dataArr[1] === 0) {
					console.log('BTN ' + (dataArr[0] - 1) + ' DOWN');
				}else if(dataArr[1] === 1) {
					console.log('BTN ' + (dataArr[0] - 1) + ' UP');
				}

			}else {	// action type: analog input

				var relX = (dataArr[1] / ANALOG_RANGE_MAX) - 0.5,
					relY = (dataArr[2] / ANALOG_RANGE_MAX) - 0.5;

			}
		}

		function onClose(data) {
			//console.log('client disconnected: ' + socket.remoteAddress + ':' + socket.remotePort);
				
			if(!playerRegistry.unregister(socket)) {
				console.log('connection closed for socket, but was not registered as player!')
			}else {
				console.log('player with ID ' + playerID + ' disconnected');
			}
		}
	});

	srv.on('error', function(e) {
		console.log('err: ' + e)
	})

	this.listen = function(port, host) {
		srv.listen(port, host, 511, function() {console.log('listening!!!!!!')});
		console.log('listen!')
	}

	this.stop = function() {
		console.log('TODO IMPL stop function')
	}
}


// ====== broadcasting server for letting clients detect the console server ======

function BroadcastServer(hostAddr, port, intervalMs, consoleTcpPort) {

	var broadcastAddress = hostAddr.split('.');
	broadcastAddress.pop();

	//broadcastAddress.push('255');	
	broadcastAddress.push('42');	// ATTENTION: debug override since broadcast is not working for Steve


	broadcastAddress = broadcastAddress.join('.');

	var msg = 'OPENKONSOLE:' + hostAddr + ':' + '' + consoleTcpPort,
		msgBuf = new Buffer(msg);

	var timer,
		udpClient = dgram.createSocket("udp4");
		udpClient.on('error' ,function(err) {
			console.log('dammit!!!')
		})

	this.start = function() {
		this.stop();
		timer = setInterval(function() {
			console.log('BroadcastServer: sending broadcast message to ' + broadcastAddress + ', message: ' + msg);
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


exports.BroadcastServer = BroadcastServer;
exports.PlayerServer = PlayerServer;