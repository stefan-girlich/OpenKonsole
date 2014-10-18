var fs = require('fs');
var dns = require('dns');
var os = require('os');
var dgram = require('dgram');
var srv = require('../js/server.js');
var jade = require('jade');


var HOST	// TODO determine this server's IP dynamically
var TCP_PORT = 1337;
var UDP_PORT = 30300;

var GAME_FILE_NAME = './views/pong.jade'; // TODO DYN



// First resolve the Host IP, then start the server.
// family returns an integer (4 = IPv4, 6 = IPv6, null = both)
// TODO Ensure IPv6 compatibility
dns.lookup(os.hostname(), function (error, address, family) {
    console.log("HOST resolved to: "+ address);
    HOST = address;
    startServer();
});


var broadcastSrv;
var playerSrv = new srv.PlayerServer();
var ipSniffer;

// seems to be visible in node-webkit; better hide and provide API method
var players = playerSrv.getPlayers();



function startServer(){

    var clientResponder = new srv.ClientResponder(HOST, UDP_PORT, TCP_PORT);

    console.log("PlayerServer started!");
    playerSrv.listen(TCP_PORT, HOST);
    
    
    loadGame(GAME_FILE_NAME)
};



function loadGame(fileName) {
    var $frame = $('#game_frame');
    var gameContent = jade.renderFile(fileName);

    // jQuery is required in order to eval scripts:
    // http://stackoverflow.com/a/1197585
    $frame.append(gameContent);
}




// TODO what other signals to catch?
// TODO test this, is it useful at all?
process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    broadcastSrv.stop();
    playerSrv.stop();
    ipSniffer.stop();
    process.exit();
});