var net = require('net');
var dgram = require('dgram');


var HOST = '192.168.178.30';
var PORT = 1337;
var UPD_PORT = 30300;


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

			// debug: display position
			drawAnalogPos(relX, relY)
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

srv.listen(PORT, HOST);

console.log('server is listening on ' + HOST + ':' + PORT);



// DEBUG SHIZZLE...

function drawAnalogPos(x, y) {

	var SIZE_X = 10, SIZE_Y = 6;


	var xIx = Math.round((x + 0.5) * (SIZE_X - 1)),
		yIx = Math.round((y + 0.5) * (SIZE_Y - 1));

		console.log(xIx+ ' ' + yIx)

	for(var i=0; i<SIZE_Y; i++) {	// vertical

		var line = '';

		for(var j=0; j<SIZE_X; j++) {	// horizontal

			line += (j === xIx && (SIZE_Y -1 )- i === yIx ? 'X' : '.')
		}

		console.log(line)
	}

	console.log(' ')
}



// ====== broadcasting server for letting clients detect the console server ======

function BroadcastServer(hostAddr, port, intervalMs) {

	var broadcastAddress = hostAddr.split('.');
	broadcastAddress.pop()

	//broadcastAddress.push('255');	
	broadcastAddress.push('42');	// ATTENTION: debug ovveride since broadcast is not working for Steve


	broadcastAddress = broadcastAddress.join('.');

	var msg = 'OPENKONSOLE:' + hostAddr + ':' + port,
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
			udpClient.send(msgBuf, 0, msgBuf.length, UPD_PORT, broadcastAddress, onError);
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

var broadcastSrv = new BroadcastServer(HOST, PORT, 1000);
broadcastSrv.start();