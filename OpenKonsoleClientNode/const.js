var chainCodesByCursorKeyCode = {
	'[A':0, 
	'[C':2,
	'[B':4,
	'[D':6
};

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

var posCenter = {x: 0, y: 0};

var chainCodesOrdered = [
	7, 		0, 		1,
	6, 		null,	2,
	5,		4,		3
];


module.exports.stickPosByChainCodes = stickPosByChainCodes;
module.exports.posCenter = posCenter;
module.exports.chainCodesOrdered = chainCodesOrdered;
module.exports.chainCodesByCursorKeyCode = chainCodesByCursorKeyCode;