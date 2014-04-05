var srv = require('./server.js');


var HOST = '192.168.178.56';	// TODO determine this server's IP dynamically
var TCP_PORT = 1337;
var UDP_PORT = 30300;

// TODO constructor args vs .listen() args
var broadcastSrv = new srv.BroadcastServer(HOST, UDP_PORT, 3000, TCP_PORT);
broadcastSrv.start();

var playerSrv = new srv.PlayerServer();
playerSrv.listen(TCP_PORT, HOST);

// seems to be visible in node-webkit; better hide and provide API method
var players = playerSrv.getPlayers();


// TODO what other signals to catch?
process.on('SIGINT', function() {
	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
	
	broadcastSrv.stop();
	playerSrv.stop();

	process.exit();
});