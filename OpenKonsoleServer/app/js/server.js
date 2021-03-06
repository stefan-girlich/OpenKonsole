var net = require('net');
var dgram = require('dgram');
var udpClient = dgram.createSocket("udp4");
var ipRange = getIpRange(1,254);


function getIpRange(min, max){
    var result = [];
    for (var i = min; i <= max; i++){
        result.push(''+i);
    }
    return result;
};


var ANALOG_RANGE_MAX = 254; // 2^8 - 1 - 1 (to enable integer center positions)

// TODO constants
var BUTTON_CODES_BY_ID = {
    0: 'START',
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D'
}

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
    var btnStates = {};
    resetButtonStates();


    var callbacks = {
        'connected': [],
        'disconnected': [],
        'stickPositionChanged': [],
        'stickPositionChangedRaw': [],
        'buttonChanged': []
    };

    var callbacksInternal = {};
    Object.keys(callbacks).forEach(function(evtType) {
        callbacksInternal[evtType] = [];
    });

    this.getID = function() { return id; };

    this.connect = function(playerSocket) {

        socket = playerSocket;

        stickPosRaw.x = stickPosRaw.y = stickPosNorm.x = stickPosNorm.y = 0;
        resetButtonStates();

        dispatchEvent('connected');
    }

    this.disconnect = function() {
        socket = null;
        dispatchEvent('disconnected');
    }

    this.isConnected = function() {
        return socket != null;
    }

    this.paused = false;

    /** x and y are RAW input values, depicting the position
     in the entire available movement area without any deadzones */
    this.setStickPos = function(x, y) {

        if(!self.paused) {
            stickPosRaw.x = x;
            stickPosRaw.y = y;

            // TODO wooooaaah... is this the simplest way?
            stickPosNorm.x = (Math.sign(x) * (Math.min(Math.abs(x), util.normalSquareMaxVal) / util.normalSquareMaxVal)) / 2;
            stickPosNorm.y = (Math.sign(y) * (Math.min(Math.abs(y), util.normalSquareMaxVal) / util.normalSquareMaxVal)) / 2;
        }

        dispatchEvent('stickPositionChanged', stickPosNorm);
        dispatchEvent('stickPositionChangedRaw', stickPosRaw);

    }

    // TODO DOC reference is stable during player session - should it also stay constant forever?
    this.getStickPos = function() { return stickPosNorm; };
    this.getStickPosRaw = function() { return stickPosRaw; };

    this.setButtonState = function(btnCode, isDown)  {
        if(!this.paused) btnStates[btnCode] = isDown;
        dispatchEvent('buttonChanged', {'code': btnCode, 'down': isDown});
    }

    this.getButtonState = function(btnCode) { return btnStates[btnCode]; }

    this.getSocket = function() { return socket; }


    // TODO "internal" flag should not be accessible through the player API
    this.on = function(eventType, callback, internal) {
        if(internal) {
            callbacksInternal[eventType].push(callback);
        }else {
            callbacks[eventType].push(callback);
        }
    }

    function dispatchEvent(type, data) {
        callbacksInternal[type].forEach(function(cb) {
            cb(self, data);
        });

        if(!self.paused) {
            callbacks[type].forEach(function(cb) {
                cb(self, data);
            });
        }
    }

    function resetButtonStates() {
        Object.keys(BUTTON_CODES_BY_ID).forEach(function(btnId) {
            btnStates[btnId] = false;
        });
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

    this.setPaused = function(paused) {

        console.log('PR.setPaused ' + paused)

        var keys = Object.keys(players);
        keys.forEach(function(k) {
            console.log('set ' + k + ' to pause: ' + paused)
            players[k].paused = paused;
        })
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

    var callbacks = {
        'pause': [],
        'unpause': []
    };

    var playerRegistry = new PlayerRegistry();

    var srv = net.createServer(function(socket) {

        console.log('client connected to server: ' + socket.remoteAddress + ':' + socket.remotePort);

        var player = playerRegistry.register(socket),
            playerID = playerRegistry.getPlayerID(socket);

        socket.write(new Buffer(playerID + '\n'));

        // TODO handle connect/login error


        socket.on('data', onDataReceived);
        socket.on('close', onClose);

        function onDataReceived(data) {
            var dataArr = new Uint8Array(util.toArrayBuffer(data));
            if(dataArr[0] < 5) { // action type: button
                var btnId = dataArr[0];
                player.setButtonState(BUTTON_CODES_BY_ID[btnId], dataArr[1] === 0);
            }else {	// action type: analog input
                player.setStickPos((dataArr[1] / ANALOG_RANGE_MAX) - 0.5, (dataArr[2] / ANALOG_RANGE_MAX) - 0.5);
            }
        }

        function onClose(data) {
            if(!playerRegistry.unregister(socket)) {
                console.log('connection closed for socket, but was not registered as player!');
            }
        }
    });

    srv.on('error', function(e) {
        console.log('err: ' + e)
    })

    this.listen = function(port, host) {
        srv.listen(port, host);
    }

    // TODO shouldn't be accessible from game
    this.setPaused = function(paused) {
        playerRegistry.setPaused(paused);
        dispatchEvent(paused ? 'pause' : 'unpause');
    }

    this.on = function(eventType, callback) {
        callbacks[eventType].push(callback);
    };

    this.getPlayers = function() {
        return playerRegistry.getPlayers();
    }

    function dispatchEvent(evtType, evtData) {
        callbacks[evtType].forEach(function(cb) {
            cb(evtData);
        });
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

    var self = this;

    var timer;
    var msg = 'OPENKONSOLE:' + hostAddr + ':' + '' + consoleTcpPort,
        msgBuf = new Buffer(msg);

    var broadcastAddress = hostAddr.split('.');
    broadcastAddress.pop();
    broadcastAddress = broadcastAddress.join('.') + '.';

    function ping(){
        ipRange.map(function(currentValue){
            if(currentValue != 'null') {
                console.log("UDP Ping sent to: "+broadcastAddress+currentValue);
                udpClient.send(msgBuf, 0, msgBuf.length, port, broadcastAddress + currentValue, function(err) {
                    if(err != null) {
                        console.log(err);
                        //udpClient.close();
                    }
                });
            }else {
                console.log('====> currentValue is actually null!!!!')
            }

            return currentValue;
        });
    };

    this.start = function() {
        this.stop();
        timer = setInterval(function() {
            //console.log('BroadcastServer: sending broadcast message to ' + broadcastAddress + ', message: ' + msg);
            ping();

            // TODO STEVE workaround for EHOSTUNREACH when repeating udpClient.send invokations
            self.stop();

        }, intervalMs);
    }


    this.stop = function() {
        if(timer) clearInterval(timer);
    }
}

function ClientResponder(hostAddr, port, consoleTcpPort) {

    var server = dgram.createSocket('udp4');

    var serverInfo = {
        host: hostAddr,
        udpPort: port,
        tcpPort: consoleTcpPort
    };

    server.on('message', function(message, rinfo) {
        console.log('server got message: ' + message + ' from ' + rinfo.address + ':' + rinfo.port);

        // TODO create only once?
        var msg = JSON.stringify(serverInfo),
            msgBuf = new Buffer(msg);

        server.send(msgBuf, 0, msgBuf.length, port, ""+rinfo.address, function(err) {
            if(err != null) {
                console.log(err);
                //udpClient.close();
            }
        });
    });

    server.on('listening', function() {
        var address = server.address();
        console.log('server listening on ' + address.address +
            ':' + address.port);
    });

    server.bind(port, hostAddr);
}

module.exports.BroadcastServer = BroadcastServer;
module.exports.PlayerServer = PlayerServer;
module.exports.IpSniffer = IpSniffer;
module.exports.ClientResponder = ClientResponder;
