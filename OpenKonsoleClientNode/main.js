var keypress = require('keypress');

var CURSOR_CODES = {
	'[A':0, 
	'[C':1,
	'[B':2,
	'[D':3
};

var currPressed = {
	0: false,
	1: false,
	2: false,
	3: false
};

var pos = {
	0: {col: 1, row: 0},
	1: {col: 2, row: 0},
	2: {col: 2, row: 1},
	3: {col: 2, row: 2},
	4: {col: 1, row: 2},
	5: {col: 0, row: 2},
	6: {col: 0, row: 1},
	7: {col: 0, row: 0}
};

keypress(process.stdin);
process.stdin.on('keypress', onKeyPress);
process.stdin.setRawMode(true);
process.stdin.resume();

clearShell();

function onKeyPress(char, key) {
	//console.log('got "keypress"', key);
	if (key && key.ctrl && key.name == 'c') {
		process.stdin.pause();
		return;
	}

	storeEvent(key);
	printDigipad();
}

function storeEvent(key) {
	var cursorKey = CURSOR_CODES[key.code];
	if(cursorKey === undefined) {
		console.log('no cursor: ' + key.code)
		return;
	}

	currPressed[cursorKey] = !currPressed[cursorKey];
	// console.log(cursorKey + ' is now ' + currPressed[cursorKey])
}


function getChainCode(col, row) {
	for(var i=0; i<8; i++) {
		if(pos[i].col === col && pos[i].row === row) {
			return i;
		}
	}
	return null;
}

function printDigipad() {

	clearShell();

	var chainCode = null;

	switch(true) {
		case currPressed[0] && currPressed[1]:	chainCode = 1; break;
		case currPressed[1] && currPressed[2]:	chainCode = 3; break;
		case currPressed[2] && currPressed[3]:	chainCode = 5; break;
		case currPressed[3] && currPressed[0]:	chainCode = 7; break;
		case currPressed[0]: chainCode = 0; break;
		case currPressed[1]: chainCode = 2; break;
		case currPressed[2]: chainCode = 4; break;
		case currPressed[3]: chainCode = 6; break;
	}

	for(var i=0; i<3; i++) {
		for(var j=0; j<3; j++) {

			if(chainCode === null) {
				printEmpty();
				continue;
			}

			if(j === pos[chainCode].col && i === pos[chainCode].row) {
				printActive();
			}else {
				var chainCodeForPos = getChainCode(j, i);
				if(chainCodeForPos != null 
					&& chainCodeForPos % 2 === 0 && currPressed[chainCodeForPos / 2] === true) {
					printPressed();
				}else {
					printEmpty();
				}
			}
		}
		process.stdout.write('\n');
	}

	function printEmpty() {	process.stdout.write('[ ]');	}
	function printActive() {	process.stdout.write('[X]');	}
	function printPressed() {	process.stdout.write('[O]');	}
}

function clearShell() {
	process.stdout.write('\u001B[2J\u001B[0;0f');
}


/*

x	0	x
3	x	1
x	2	x

7	0	1
6	x	2
5	4	3

*/