module.exports.UiMenu = function() {

	this.setMenuFrame = function($menuFrame) {
		console.log($menuFrame);
	}

	this.onConnected = function(player) {
		console.log('onConnected')
		console.log(player)
	}

	this.onDisconnected = function(player) {
		console.log('onDisconnected')
		console.log(player)
	}

	this.stickPositionChangedRaw = function(player, stickPos) {
		console.log('stickPositionChangedRaw')
		console.log(player)
		console.log(stickPos)
	}

	this.stickPositionChanged = function(player, stickPos) {
		console.log('stickPositionChanged')
		console.log(player)
		console.log(stickPos)
	}

	this.buttonChanged = function(player, btnId, down) {
		console.log('buttonChanged ')
		console.log(player)
		console.log(btnId)
		console.log(down)
	}
}