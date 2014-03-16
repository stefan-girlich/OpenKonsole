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


var playerOne = null, playerTwo = null;


var srv = net.createServer(function(socket) {

	console.log('client connected to server: ' + socket.remoteAddress + ':' + socket.remotePort);

	var playerID;
	if(playerOne == null) {
		playerOne = socket;
		playerID = 0;
	}else if(playerTwo == null) {
		playerTwo = socket;
		playerID = 1;
	}else {
		console.log('no empty player slots available!!!');
		playerID = -1;
	}


	console.log('player connected with playerID: ' + playerID)
	socket.write(new Buffer(playerID + '\n'));


	socket.on('data', function(data) {
		//console.log('client sent message: ' + socket.remoteAddress + ':' + socket.remotePort);


		if(socket == playerOne) {
			console.log('=========== playerOne ===========');
		}else if(socket == playerTwo) {
			console.log('=========== playerTwo ===========');
		}else {
			console.log('data sent by unregistered player!!!!! : ' + data.toString());
		}

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
			
		if(playerOne == socket) {
			playerOne = null;
			console.log('playerOne disconnected');
		}else if(playerTwo == socket) {
			playerTwo = null;
			console.log('playerTwo disconnected');
		}else {
			console.log('no player found to remove!!!');
		}
	});
});

srv.listen(PORT, HOST);

console.log('server is listening on ' + HOST + ':' + PORT);