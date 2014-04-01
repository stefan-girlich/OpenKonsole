var srv = require('./server.js');


var HOST = '192.168.178.30';	// TODO determine this server's IP dynamically
var TCP_PORT = 1337;
var UDP_PORT = 30300;

// TODO constructor args vs .listen() args
var broadcastSrv = new srv.BroadcastServer(HOST, UDP_PORT, 3000, TCP_PORT);
broadcastSrv.start();

var playerSrv = new srv.PlayerServer();
playerSrv.listen(TCP_PORT, HOST);


// TODO what other signals to catch?
process.on('SIGINT', function() {
	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
	
	broadcastSrv.stop();
	playerSrv.stop();

	process.exit();
});


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