var keypress = require('keypress');
var cl = require('./client.js');
var constants = require('./const.js');
var ui = require('./ui.js');
var stick = require('./stick.js');

var CURSOR_CODES = {
	'[A':0, 
	'[C':2,
	'[B':4,
	'[D':6
};

var stickPosByCC = constants.stickPosByChainCodes;
var posCenter = constants.posCenter;
var stickState = {};
for(var i=0; i<Object.keys(stickPosByCC).length; i++) {
	stickState[i] = {pressed: false, active: false}
}

var buttons = {
	'A': false
};

keypress(process.stdin);
process.stdin.on('keypress', onKeyPress);
process.stdin.setRawMode(true);
process.stdin.resume();


var playerId = null;

var client = new cl.Client(function(srvMsg) {
	playerId = srvMsg;
	console.log('playerId assigned from server: ' + playerId)
});

//client.connect();


function onKeyPress(char, key) {
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause();
		//client.disconnect();
		return;
	}

	if(!storeKeyPress(key)) {
		// handle any non-cursor key press as button A
		// TODO DEBUG ONLY
		buttons['A'] = !buttons['A'];
		//client.sendButton('A', state);
		return;
	}

	var stickCC = stick.updateStickState(stickState);
	updateUi(stickCC);

	var f = 0.5;
	var p = stickPosByCC[stickCC];
	if(stickCC == null) {
		p = posCenter;
	}

	//client.sendStick(p.x * f, p.y * f)
}

function storeKeyPress(key) {
	var cursorKey = CURSOR_CODES[key.code];
	if(cursorKey === undefined) {
		console.log('no cursor: ' + key.code)
		return false;
	}

	stickState[cursorKey].pressed = !stickState[cursorKey].pressed;
	return true;
}


function updateUi(stickCC) {
	ui.clear();
	ui.printStickState(stickState, stickCC);
	ui.printLineBreak();
	ui.printStickPos(stickCC);
}