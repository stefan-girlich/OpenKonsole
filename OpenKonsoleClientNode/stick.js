/** 
stickState: map stick chain codes to chain code states; state {pressed:boolean, active: boolean}

- checks horizontal and vertical chain codes for "pressed" state
- if only one chain code "pressed": set one arbitrary horizontal/vertical "active" property true 
- if multiple chain codes "pressed": set one arbitrary diagonal chain code "active" property true 
between two consecutive "pressed" horizontal/vetical chain codes
- mark max one chain code "active"

return: active chain code or null if stick is centered

TODO horribly complicated algorithm
*/
function updateStickState(stickState) {
	var chainCode = null;
	var codesSize = Object.keys(stickState).length;

	for(var i=0; i<codesSize; i = i+2) {
		var nextKeyPos = (i + 2) % codesSize;
		var diagonalPos = i + 1;
		var currKeyPressed = stickState[i].pressed;
		var nextKeyPressed = stickState[nextKeyPos].pressed;
		
		if(chainCode == null) {
			if(currKeyPressed) {
				if(!nextKeyPressed) {
					stickState[i].active = true;
					stickState[diagonalPos].active = false;
					chainCode = i;
				}else {
					stickState[i].active = false;
					stickState[diagonalPos].active = true;
					stickState[nextKeyPos].active = false;
					chainCode = diagonalPos;
				}
			}else {
				stickState[i].active = false;
				stickState[diagonalPos].active = false;
				stickState[nextKeyPos].active = false;
			}

		}else {
			if(i === codesSize - 2 && currKeyPressed && stickState[nextKeyPos].pressed) {
				stickState[i].active = false;
				stickState[diagonalPos].active = true;
				stickState[nextKeyPos].active = false;
				stickState[nextKeyPos+1].active = false;
				chainCode = diagonalPos;
			}else {
				stickState[i].active = false;
				stickState[diagonalPos].active = false;
			}
		}
	}

	return chainCode;
}

module.exports.updateStickState = updateStickState;