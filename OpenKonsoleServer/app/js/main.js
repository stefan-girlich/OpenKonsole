var fs = require('fs');
var dns = require('dns');
var os = require('os');
var dgram = require('dgram');
var srv = require('../js/server.js');
var jade = require('jade');


var HOST	// TODO determine this server's IP dynamically
var TCP_PORT = 1337;
var UDP_PORT = 30300;

// First resolve the Host IP, then start the server.
// family returns an integer (4 = IPv4, 6 = IPv6, null = both)
// TODO Ensure IPv6 compatibility
dns.lookup(os.hostname(), function (error, address, family) {
    console.log("HOST resolved to: "+ address);
    HOST = address;
    startServer();
});


console.log(srv);

var broadcastSrv;
var playerSrv = new srv.PlayerServer();
var ipSniffer;

// seems to be visible in node-webkit; better hide and provide API method
//var players = playerSrv.getPlayers();



function startServer(){

    var clientResponder = new srv.ClientResponder(HOST, UDP_PORT, TCP_PORT);

    return;

    console.log("IP sniffer started");
    ipSniffer = new IpSniffer(HOST, UDP_PORT, 3000, TCP_PORT);
    ipSniffer.start();

    // broadcastSrv = new srv.BroadcastServer(HOST, UDP_PORT, 3000, TCP_PORT);
    // broadcastSrv.start();
    //console.log("BroadcastServer started");

    console.log("PlayerServer started!");
    playerSrv.listen(TCP_PORT, HOST);
    $('#content').append(jade.renderFile('./views/pong.jade'));
};

// TODO what other signals to catch?
process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    broadcastSrv.stop();
    playerSrv.stop();
    ipSniffer.stop();
    process.exit();
});