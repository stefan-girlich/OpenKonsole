var constants = require('./const.js');


var STICK_CC_ORDERED = constants.chainCodesOrdered;
var STICK_POS_BY_CC = constants.stickPosByChainCodes;
var STICK_POS_CENTER = constants.posCenter;


function printStickState(stickState, stickPosCC) {

	for(var i=0; i<STICK_CC_ORDERED.length; i++) {
		var currCC = STICK_CC_ORDERED[i];

		if(currCC == null) {	// d-pad center
			if(stickPosCC == null) {
				printActive();
			}else {
				printEmptyCenter();
			}
			
		}else {					// d-pad used
			if(stickState[currCC].active) {
				printActive();
			}else if(stickState[currCC].pressed) {
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

function printStickPos(chainCode) {
	var stickPos;

	if(chainCode == null) {
		stickPos = STICK_POS_CENTER;
	}else {
		stickPos = STICK_POS_BY_CC[chainCode];
	}

	print('stick:   x: ' + stickPos.x + '  y: ' + stickPos.y);
}

function clear() {
	process.stdout.write('\u001B[2J\u001B[0;0f');
}

function print(txt) {	process.stdout.write(txt);	}
function printEmpty() {	print('[ ]');	}
function printActive() {	print('[X]');	}
function printPressed() {	print('[O]');	}
function printLineBreak() {	print('\n');	}
function printEmptyCenter() {	print('[+]');	}



module.exports.clear = clear;
module.exports.printStickState = printStickState;
module.exports.printStickPos = printStickPos;
module.exports.print = print;
module.exports.printLineBreak= printLineBreak;

