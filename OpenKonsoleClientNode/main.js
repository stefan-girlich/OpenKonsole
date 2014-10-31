var keypress = require('keypress');
var cl = require('./client.js');
var constants = require('./const.js');
var ui = require('./ui.js');
var stick = require('./stick.js');

// ===== constants =====

var CURSOR_CODES = constants.chainCodesByCursorKeyCode;
var STICK_POS_BY_CC = constants.stickPosByChainCodes;
var POS_CENTER = constants.posCenter;


// ===== input state =====

var stickState = {};
for(var i=0; i<Object.keys(STICK_POS_BY_CC).length; i++) {
	stickState[i] = {pressed: false, active: false}
}

var btnStates = {};
for(var i=0; i<Object.keys(constants.buttonIDsByCode).length; i++) {
	btnStates[i] = false;
}

keypress(process.stdin);
process.stdin.on('keypress', onKeyPress);
process.stdin.setRawMode(true);
process.stdin.resume();


var playerId = null;

var client = new cl.Client(function(srvMsg) {
	playerId = srvMsg;
	console.log('playerId assigned from server: ' + playerId)
});

client.connect();


function onKeyPress(char, key) {
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause();
		client.disconnect();
		return;
	}

	if(!storeKeyPress(key)) {
		// handle any non-cursor key press as button A
		// TODO DEBUG ONLY
		
		btnStates['A'] = !btnStates['A'];
		client.sendButton('A', btnStates['A']);
		return;
	}

	var stickCC = stick.updateStickState(stickState);
	updateUi(stickCC);

	var p = STICK_POS_BY_CC[stickCC];
	if(stickCC == null) {
		p = POS_CENTER;
	}

	client.sendStick(p.x * constants.stickMaxLevel, p.y * constants.stickMaxLevel);
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