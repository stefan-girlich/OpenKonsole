var fs = require('fs');
var dns = require('dns');
var os = require('os');
var dgram = require('dgram');
var srv = require('../js/server.js');
var jade = require('jade');


var USER_DIR = '.openkonsole/';
var CONFIG_FILE = 'config.json';
var GAME_NAME = 'pong'; // TODO DYN
var JADE_FILENAME = 'index.jade';


var config = readConfig();
var playerSrv = new srv.PlayerServer();

if(config.host) {
    startServer(config.host, config.tcpPort, config.udpPort);
}else {
    // family returns an integer (4 = IPv4, 6 = IPv6, null = both)
    // TODO Ensure IPv6 compatibility
    // TODO TEST
    dns.lookup(os.hostname(), function (error, address, family) {
        startServer(address, config.tcpPort, config.udpPort);
    });
}

// TODO seems to be visible in node-webkit; better hide and provide API method
var players = playerSrv.getPlayers();


function startServer(host, tcpPort, udpPort) {

    var clientResponder = new srv.ClientResponder(host, udpPort, tcpPort);
    playerSrv.listen(tcpPort, host);

    // TODO DEBUG ONLY, game should be launched from UI
    var conf = readConfig();
    loadGame(conf.gamesDirectory, GAME_NAME)
};



function loadGame(gamesDir, gameName) {
    gamesDir = fixTrailingDirSeparator(gamesDir);
    var gameBaseDir = gamesDir + GAME_NAME + '/';
    var gameFilePath =  gameBaseDir + JADE_FILENAME;
    var gameContent = jade.renderFile(gameFilePath);

    copyGameFiles(gameBaseDir, process.cwd(), gameName);

    var $gameContent = $(gameContent),
        resPathPrefix = '../' + gameName + '/'; // TODO to constant/method/rule

    updateResourcePaths($gameContent, resPathPrefix, 'script', 'src');
    updateResourcePaths($gameContent, resPathPrefix, 'link', 'href'); // TODO "link" other than CSS?
    // TODO "img"

    // jQuery is required in order to eval scripts:
    // http://stackoverflow.com/a/1197585
    var $frame = $('#game_frame');
    $frame.append($gameContent);
}


function updateResourcePaths($gameContent, resPathPrefix, elementType, attrType) {
    $gameContent.filter(elementType).each(function(ix, el) {
        el = $(el);
        var path = el.attr(attrType);

        if(path) {
            path = resPathPrefix + path;
            el.attr(attrType, path);
        }
    });
}

function copyGameFiles(gameBaseDir, processWorkingDir, gameName) {
    var gameFiles = fs.readdirSync(gameBaseDir);

    var dstDir = processWorkingDir + '/' + gameName + '/';
    mkdirSync(dstDir);

    for(var i=0; i<gameFiles.length; i++) {
        var fileName = gameFiles[i];
        var srcPath = gameBaseDir + fileName;
        var dstPath = dstDir + fileName;
        fs.writeFileSync(dstPath, fs.readFileSync(srcPath));
    }
}

function mkdirSync(path) {
    try { fs.mkdirSync(path); } catch(e) { if ( e.code != 'EEXIST' ) throw e;}
}

function readConfig() {
    var userDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    userDir = fixTrailingDirSeparator(userDir);

    var openKonsoleConfig = userDir + USER_DIR + CONFIG_FILE;
    var conf = fs.readFileSync(openKonsoleConfig);
    // TODO err handling

    return JSON.parse(conf);
}

function fixTrailingDirSeparator(path) {
    if(path.lastIndexOf('/') != path.length - 1) {
        path = path + '/';
    }
    return path;
}