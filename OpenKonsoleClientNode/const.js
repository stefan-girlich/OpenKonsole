// ====== OpenKonsole protocol ======

// todo freeze constants

var buttonIDsByCode = {
	'START': 0,
	'A': 1,
	'B': 2,
	'C': 3,
	'D': 4
}
var stickID = 5;


// ====== UI input ======

var chainCodesByCursorKeyCode = {
	'[A':0, 
	'[C':2,
	'[B':4,
	'[D':6
};

var buttonCodesByKeyName = {
	's': 'A',
	'a': 'B',
	'w': 'C',
	'q': 'D',
	'x': 'START'
}

var stickPosByChainCodes = {
	0: {x: 0,	y: -1,	pressed: false, active: false},
	1: {x: 1,	y: -1,	pressed: false, active: false},
	2: {x: 1,	y: 0,	pressed: false, active: false},
	3: {x: 1,	y: 1,	pressed: false, active: false},
	4: {x: 0,	y: 1,	pressed: false, active: false},
	5: {x: -1,	y: 1,	pressed: false, active: false},
	6: {x: -1,	y: 0,	pressed: false, active: false},
	7: {x: -1,	y: -1,	pressed: false, active: false}
};

var stickMaxLevel = 0.5; // to each horizontal/vertical side, from center

var posCenter = {x: 0, y: 0};

var chainCodesOrdered = [
	7, 		0, 		1,
	6, 		null,	2,
	5,		4,		3
];


module.exports.buttonIDsByCode = buttonIDsByCode;
module.exports.stickID = stickID;
module.exports.stickPosByChainCodes = stickPosByChainCodes;
module.exports.posCenter = posCenter;
module.exports.chainCodesOrdered = chainCodesOrdered;
module.exports.chainCodesByCursorKeyCode = chainCodesByCursorKeyCode;
module.exports.buttonCodesByKeyName = buttonCodesByKeyName;
module.exports.stickMaxLevel = stickMaxLevel;