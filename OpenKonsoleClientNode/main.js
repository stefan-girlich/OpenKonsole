'use strict' // TODO for all files with module use-strict

var keypress = require('keypress');
var cl = require('./client.js');
var constants = require('./const.js');
var ui = require('./ui.js');
var stick = require('./stick.js');

// ===== constants =====

var CURSOR_CODES = constants.chainCodesByCursorKeyCode;
var STICK_POS_BY_CC = constants.stickPosByChainCodes;
var BTN_IDS_BY_CODE = constants.buttonIDsByCode;
var BTN_CODES_BY_KEY_NAME = constants.buttonCodesByKeyName;
var POS_CENTER = constants.posCenter;


// ===== input state =====
var currStickCC = null;
var stickState = {};
for(var i=0; i<Object.keys(STICK_POS_BY_CC).length; i++) {
	stickState[i] = {pressed: false, active: false}
}

var btnStates = {}; // by code
for(var i=0; i<Object.keys(BTN_IDS_BY_CODE).length; i++) {
	btnStates[Object.keys(BTN_IDS_BY_CODE)[i]] = false;
}

var playerId = null;

// ===== controller logic =====

keypress(process.stdin);
process.stdin.on('keypress', onKeyPress);
process.stdin.setRawMode(true);
process.stdin.resume();

var client = new cl.Client(function(srvMsg) {
	playerId = srvMsg;
});

client.connect();

updateUi();

// ===== functions =====

function onKeyPress(char, key) {
	var handler = getHandler(key);
	handler(key);
}

function getHandler(key) {
	switch(true) {

		case key.ctrl && key.name == 'c':
			return onKillEvent;

		case CURSOR_CODES[key.code] !== undefined:
			return onStickEvent;

		case BTN_CODES_BY_KEY_NAME[key.name] !== undefined:
			return onButtonEvent;

		default:
			return onIllegalInput;
	}
}

function onStickEvent(key) {
	var cursorKey = CURSOR_CODES[key.code];
	stickState[cursorKey].pressed = !stickState[cursorKey].pressed;
	currStickCC = stick.updateStickState(stickState);

	var p = STICK_POS_BY_CC[currStickCC];
	if(currStickCC == null) {
		p = POS_CENTER;
	}

	client.sendStick(p.x * constants.stickMaxLevel, p.y * constants.stickMaxLevel);

	updateUi();
}

function onButtonEvent(key) {
	var btnCode = BTN_CODES_BY_KEY_NAME[key.name];
	btnStates[btnCode] = !btnStates[btnCode];
	client.sendButton(btnCode, btnStates[btnCode]);
	updateUi();
}

function onKillEvent(key) {
	process.stdin.pause();
	ui.printLineBreak();
	client.disconnect();
}

function onIllegalInput(key) {
	ui.printLineBreak();
	ui.print('Illegal input, doing nothing!')
}


function updateUi() {
	ui.clear();
	ui.printStickState(stickState, currStickCC);
	ui.printStickPos(currStickCC);
	ui.printLineBreak();
	ui.printLineBreak();
	ui.printButtons(btnStates);
}