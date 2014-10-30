var keypress = require('keypress');
var cl = require('./client.js');

var CURSOR_CODES = {
	'[A':0, 
	'[C':2,
	'[B':4,
	'[D':6
};

var pos = {
	0: {x: 0,	y: -1,	pressed: false, active: false},
	1: {x: 1,	y: -1,	pressed: false, active: false},
	2: {x: 1,	y: 0,	pressed: false, active: false},
	3: {x: 1,	y: 1,	pressed: false, active: false},
	4: {x: 0,	y: 1,	pressed: false, active: false},
	5: {x: -1,	y: 1,	pressed: false, active: false},
	6: {x: -1,	y: 0,	pressed: false, active: false},
	7: {x: -1,	y: -1,	pressed: false, active: false}
};

var posCenter = {x: 0, y: 0};

var posOrdered = [
	7, 		0, 		1,
	6, 		null,	2,
	5,		4,		3
];

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
		buttons['A'] = !buttons['A'];
		client.sendButton('A', buttons['A']);
		return;
	}

	var dPadChainCode = updateDpadState();
	updateUi(dPadChainCode);

	var f = 0.5;
	var p = pos[dPadChainCode];
	if(dPadChainCode == null) {
		p = posCenter;
	}

	client.sendStick(p.x * f, p.y * f)
}

function storeKeyPress(key) {
	var cursorKey = CURSOR_CODES[key.code];
	if(cursorKey === undefined) {
		console.log('no cursor: ' + key.code)
		return false;
	}

	pos[cursorKey].pressed = !pos[cursorKey].pressed;
	return true;
}

/** Calculates the current d-pad direction base on the key state map "pos", marks 
the chain code reprenting the current direction in the map and returns it.
TODO horribly complicated algorithm
*/
function updateDpadState() {
	var chainCode = null;
	var codesSize = Object.keys(pos).length;

	for(var i=0; i<codesSize; i = i+2) {
		var nextKeyPos = (i + 2) % codesSize;
		var diagonalPos = i + 1;
		var currKeyPressed = pos[i].pressed;
		var nextKeyPressed = pos[nextKeyPos].pressed;
		
		if(chainCode == null) {
			if(currKeyPressed) {
				if(!nextKeyPressed) {
					pos[i].active = true;
					pos[diagonalPos].active = false;
					chainCode = i;
				}else {
					pos[i].active = false;
					pos[diagonalPos].active = true;
					pos[nextKeyPos].active = false;
					chainCode = diagonalPos;
				}
			}else {
				pos[i].active = false;
				pos[diagonalPos].active = false;
				pos[nextKeyPos].active = false;
			}

		}else {
			if(i === codesSize - 2 && currKeyPressed && pos[nextKeyPos].pressed) {
				pos[i].active = false;
				pos[diagonalPos].active = true;
				pos[nextKeyPos].active = false;
				pos[nextKeyPos+1].active = false;
				chainCode = diagonalPos;
			}else {
				pos[i].active = false;
				pos[diagonalPos].active = false;
			}
		}
	}

	return chainCode;
}


// --- graphics util ---

function updateUi(dPadChainCode) {
	clearShell();
	printDigipad(dPadChainCode);
	printLineBreak();
	printDigipadPosition(dPadChainCode);
}

function printDigipad(chainCode) {

	for(var i=0; i<posOrdered.length; i++) {
		var currCC = posOrdered[i];

		if(currCC == null) {	// d-pad centered
			if(chainCode == null) {
				printActive();
			}else {
				printEmptyCenter();
			}
			
		}else {					// d-pad used
			if(pos[currCC].active) {
				printActive();
			}else if(pos[currCC].pressed) {
				printPressed();
			}else {
				printEmpty();
			}
		}

		// TODO "is last in line", should be possible easier based on i...
		if(currCC != null && currCC >= 1 && currCC <= 3) {
			printLineBreak();
		}
	}
}

function printDigipadPosition(chainCode) {
	var x, y;

	if(chainCode == null) {
		x = posCenter.x;
		y = posCenter.y;
		
	}else {
		x = pos[chainCode].x;
		y = pos[chainCode].y;
	}

	print('d-pad:   x: ' + x + '  y: ' + y);
}

function clearShell() {
	process.stdout.write('\u001B[2J\u001B[0;0f');
}

function print(txt) {	process.stdout.write(txt);	}
function printEmpty() {	print('[ ]');	}
function printActive() {	print('[X]');	}
function printPressed() {	print('[O]');	}
function printLineBreak() {	print('\n');	}
function printEmptyCenter() {	process.stdout.write('[+]');	}