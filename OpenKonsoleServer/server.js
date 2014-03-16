var net = require('net');

var HOST = '192.168.178.30';
var PORT = 1337;


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


	socket.on('data', function(data) {
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
			console.log('NOT IMPL YET #0')
		}
		
	});

	socket.on('close', function(data) {
		//console.log('client disconnected: ' + socket.remoteAddress + ':' + socket.remotePort);
			
		if(!playerRegistry.unregister(socket)) {
			console.log('connection closed for socket, but was not registered as player!')
		}else {
			console.log('player with ID ' + playerID + ' disconnected');
		}
	});
});

srv.listen(PORT, HOST);

console.log('server is listening on ' + HOST + ':' + PORT);