module.exports.UiMenu = function() {

	var $menuFrame;

	this.setMenuFrame = function($el) {
		 $menuFrame = $el;
	}

	this.setVisible = function(visible) {
		if(!$menuFrame) { 
			return;
		}

		if(visible) {
			$menuFrame.removeClass('hidden');
		}else {
			$menuFrame.addClass('hidden');
		}
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

	this.buttonChanged = function(player, evt) {
		return;
		console.log('buttonChanged ')
		console.log(player)
		console.log(evt.code)
		console.log(evt.down)
	}
}