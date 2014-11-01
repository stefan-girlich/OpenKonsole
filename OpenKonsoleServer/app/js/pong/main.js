// TODO WORKAROUND el_stageWrap.offsetWidth and el_stageWrap.offsetHeight contains wrong values when 
// grabbing them right away in this script, so we use a delay for now
setTimeout(function() {



// ========== game logic, 3D representation ===========

var PAD = {
	size: {
		x: 20,
		y: 20,
		z: 80
	},
	offsetY: 12
};

var COURT = {
	size: {
		x: 800,
		y: 0.000001,
		z: 400
	},
	paddingX: 10
}

var BALL = {
	radius: 8,
	segments: 32,
	bounceHeight: 14,
	bounceRate: 250
}

var CAMERA = {
	ballTrackFactorX: 0.02,
	ballTrackFactorY: 0.01,
	ballTrackFactorZ: 0.02
}


var STATE = {
	home: 0,
	countdown: 1,
	playing: 2,
	paused: 3,
	masterPaused: 4,
	pointScored: 5
};


var CONSTR = {
	paddleMaxSpeed: 24,
	paddleSpeedDampingFactor: 0.8,
	paddleSpeedGainAmount: 0.4,	// 1/ms
	paddleMaxPos: (COURT.size.z - PAD.size.z) / 2,
	ballMaxPosX: (COURT.size.x - BALL.radius - 2 * PAD.size.x) / 2,
	ballMaxPosZ: (COURT.size.z - BALL.radius) / 2,
	ballSpeed: 0.3,	// 1/ms
	ballLostTimeout: 3000, // ms
	countDownTime: 1, // s
	pointScoredTimeout: 2 // s
}


function PlayerPaddle() {

	this.speed = 0;

	this.addSpeed = function(speedAmt) {
		this.speed += speedAmt;
		this.speed *= CONSTR.paddleSpeedDampingFactor;
		if(Math.abs(this.speed) < 0.00000001) this.speed = 0;
		if(this.speed > CONSTR.paddleMaxSpeed) {
			this.speed = CONSTR.paddleMaxSpeed;
		}else if(this.speed < -CONSTR.paddleMaxSpeed) {
			this.speed = -CONSTR.paddleMaxSpeed;
		}
	}

	this.brakeToStop = function() {
		this.speed = 0;
	}
}


function Ball(initAngleRad) {
	var self = this;
	var angle = initAngleRad;
	this.x = 0;
	this.z = 0;

	this.move = function(dist) {
		this.x += dist * Math.cos(angle);
		this.z += dist * Math.sin(angle);
	}

	this.reset = function() {
		this.isLost = false;
		this.x = this.z = 0;
	}

	this.bounceX = function() {
		angle = Math.PI - angle;
	}

	this.bounceZ = function() {
		angle = -angle;
	}

	this.isLost = false;
}


var el_stageWrap = document.querySelector('#stage_wrap');


// run-time game logic params
var lgPaddles = [
	new PlayerPaddle(),
	new PlayerPaddle()
];
var lgBall = new Ball(Math.PI / 4);		// = 45°; TODO random initial ball angle


var gameState;
var lastTime = 0;
var countdownRemaining = CONSTR.countDownTime * 1000;


// catch user button press releases asynchronously
players[0].on('buttonChanged', onUserButtonPress);
players[1].on('buttonChanged', onUserButtonPress);

function onUserButtonPress(player, btnId, down) {
	if(!down) {
		switch(gameState) {
			case STATE.home:
				switchGameState(STATE.countdown);
				break;

			case STATE.playing:
				switchGameState(STATE.paused);
				break;

			case STATE.paused:
				switchGameState(STATE.countdown);
				break;
		}
	}
}


// initialize game state
switchGameState(STATE.home);


function switchGameState(state) {
	switch(state) {

		case STATE.home:
			var ui_home = el_stageWrap.querySelector('.ui.home');
			ui_home.style.display = 'block';
			break;

		case  STATE.playing:
			hideAllUi();
			break;

		case STATE.countdown:
			hideAllUi();
			var ui_countdown = el_stageWrap.querySelector('.ui.countdown');
			ui_countdown.style.display = 'block';

			countdownRemaining = CONSTR.countDownTime * 1000
			break;

		case STATE.paused:
			hideAllUi();
			var ui_paused = el_stageWrap.querySelector('.ui.paused');
			ui_paused.style.display = 'block';
			break;

		case STATE.pointScored:

			hideAllUi();
			var ui_scored = el_stageWrap.querySelector('.ui.scored');
			ui_scored.style.display = 'block';
			
			countdownRemaining = CONSTR.pointScoredTimeout * 1000
			break;
	}

	gameState = state;

	function hideAllUi() {
		var all_ui = el_stageWrap.querySelectorAll('.ui');
		for(var i=0; i<all_ui.length; i++) {
			all_ui[i].style.display = 'none';
		}
	}
}


function setCountDownState(countdown) {
	var ui_countdown = el_stageWrap.querySelector('.ui.countdown'),
		ui_countdown_text = ui_countdown.querySelector('.text');

	ui_countdown_text.innerHTML = countdown;
}

// this function is executed on each animation frame
function animate(){
	// update
	var time = (new Date()).getTime();
	var timeDiff = time - lastTime;
	lastTime = time;

	// prevent too high value being passed,
	// pass 60fps interval instead
	if(timeDiff === time) {
		timeDiff = 17;
	}


	// TODO move to switchGameState
	var activeCamera = camera;

	if(gameState === STATE.home) {

		activeCamera = cameraIdle;

		cameraIdle.position.x = Math.sin(time / 5000) * 330;
		cameraIdle.position.z = Math.cos(time / 5000) * 330;
		cameraIdle.lookAt(new THREE.Vector3(0, 0, 0));

	}else if(gameState === STATE.countdown) {

		countdownRemaining -= timeDiff;

		if(countdownRemaining > 2000) {
			setCountDownState(3);
		}else if(countdownRemaining > 1000) {
			setCountDownState(2);
		}else if(countdownRemaining > 0) {
			setCountDownState(1);
		}else {
			switchGameState(STATE.playing);
		}

	}else if(gameState === STATE.playing) {
		updatePads(timeDiff);
		updateBall(time, timeDiff);

		camera.lookAt(new THREE.Vector3(
			ball.position.x * CAMERA.ballTrackFactorX, 
			ball.position.y * CAMERA.ballTrackFactorY, 
			ball.position.z * CAMERA.ballTrackFactorZ
		));

	}else if(gameState === STATE.paused) {
		activeCamera = cameraIdle;
		cameraIdle.position.x = Math.sin(time / 5000) * 330;
		cameraIdle.position.z = Math.cos(time / 5000) * 330;
		cameraIdle.lookAt(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z));

	}else if(gameState === STATE.pointScored) {
		updatePads(timeDiff);
		updateBall(time, timeDiff);

		ball.material.opacity -= 0.003 * timeDiff;

		countdownRemaining -= timeDiff;

		if(countdownRemaining < 0) {
			switchGameState(STATE.countdown);
			ball.material.opacity = 1.0;
			lgBall.reset();
			ball.position.x = lgBall.x;
			ball.position.z = lgBall.z;
			camera.lookAt(new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z));
		}
	}else {
		console.log(' TODO unhandled state? ' + gameState)
	}

	renderer.render(scene, activeCamera);	// render

	// request new frame
	requestAnimationFrame(function(){
	    animate();
	});
}


function updatePads(elapsedTime) {
	// update paddle movements/positions
	for(var i=0; i<lgPaddles.length; i++) {

		lgPaddles[i].addSpeed(players[i].getStickPosRaw().y * CONSTR.paddleSpeedGainAmount * elapsedTime);

		pads[i].position.z += lgPaddles[i].speed;

		if(pads[i].position.z > CONSTR.paddleMaxPos) {
			pads[i].position.z = CONSTR.paddleMaxPos;
			lgPaddles[i].brakeToStop();
		}else if(pads[i].position.z < -CONSTR.paddleMaxPos) {
			pads[i].position.z = -CONSTR.paddleMaxPos;
			lgPaddles[i].brakeToStop();
		}
	}
}


function updateBall(time, elapsedTime) {

	lgBall.move(CONSTR.ballSpeed * elapsedTime);

	var bounceY = Math.abs(Math.sin(time / BALL.bounceRate) * BALL.bounceHeight);

	ball.position.x = lgBall.x;
	ball.position.y = bounceY;
	ball.position.z = lgBall.z;
	
	if(lgBall.isLost) return;


	// TODO does it make sense to calculate the clipped pos more precisely?
	if(ball.position.z > CONSTR.ballMaxPosZ) {
		ball.position.z = CONSTR.ballMaxPosZ;
		lgBall.bounceZ();
	}else if(ball.position.z < -CONSTR.ballMaxPosZ) {
		ball.position.z = -CONSTR.ballMaxPosZ;
		lgBall.bounceZ();
	}

	if(ball.position.x > CONSTR.ballMaxPosX) {

		if(ball.position.z < pads[1].position.z - PAD.size.z / 2
			|| ball.position.z > pads[1].position.z + PAD.size.z / 2) {
			// out!
			
			switchGameState(STATE.pointScored);

			lgBall.isLost = true;	// TODO remove, is handled by STATE
		}else {
			ball.position.x = CONSTR.ballMaxPosX;
			lgBall.bounceX();
		}

	}else if(ball.position.x < -CONSTR.ballMaxPosX) {

		if(ball.position.z < pads[0].position.z - PAD.size.z / 2
			|| ball.position.z > pads[0].position.z + PAD.size.z / 2) {
			// out!
			
			switchGameState(STATE.pointScored);

			lgBall.isLost = true;
		}else {
			ball.position.x = -CONSTR.ballMaxPosX;
			lgBall.bounceX();
		}
	}
}

// renderer
var renderer = new THREE.WebGLRenderer();
console.log('el_stageWrap.offsetWidth ' + el_stageWrap.offsetWidth)
console.log('el_stageWrap.offsetHeight ' + el_stageWrap.offsetHeight)
renderer.setSize(el_stageWrap.offsetWidth, el_stageWrap.offsetHeight);
renderer.setClearColor(0xbbbbbb, 1);


el_stageWrap.appendChild(renderer.domElement);

// camera
var camera = new THREE.PerspectiveCamera(60, el_stageWrap.offsetWidth / el_stageWrap.offsetHeight, 1, 1000);
camera.position.set(0, 600, 320);
camera.up = new THREE.Vector3(0, 1, 0);
camera.lookAt(new THREE.Vector3(0,0,0));

var cameraIdle = new THREE.PerspectiveCamera(10, el_stageWrap.offsetWidth / el_stageWrap.offsetHeight, 1, 1000);
cameraIdle.position.y = 20;
cameraIdle.up = new THREE.Vector3(0, 1, 0);



// enable shadow rendering
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

renderer.shadowCameraNear = 3;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;

renderer.shadowMapBias = 0.0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;



// scene
var scene = new THREE.Scene();

// court
var court = new THREE.Mesh(new THREE.CubeGeometry(
	COURT.size.x + 2 * COURT.paddingX, 
	COURT.size.y, 
	COURT.size.z), 
	new THREE.MeshLambertMaterial({color: 0xcccccc }));
court.receiveShadow = true;
court.position.y = - PAD.size.y / 2;
court.overdraw = true;
scene.add(court);
        
// paddles
var paddleOne = new THREE.Mesh(new THREE.CubeGeometry(PAD.size.x, PAD.size.y, PAD.size.z), new THREE.MeshLambertMaterial({color: 'blue' }));
paddleOne.position.x = -(COURT.size.x / 2 - PAD.size.x / 2);
paddleOne.position.y = PAD.offsetY;
paddleOne.overdraw = true;
paddleOne.castShadow = true;
scene.add(paddleOne);
var paddleTwo = new THREE.Mesh(new THREE.CubeGeometry(PAD.size.x, PAD.size.y, PAD.size.z), new THREE.MeshLambertMaterial({color: 'red' }));
paddleTwo.position.x = (COURT.size.x / 2 - PAD.size.x / 2);
paddleTwo.position.y = PAD.offsetY
paddleTwo.overdraw = true;
paddleTwo.castShadow = true;
scene.add(paddleTwo);

var pads = [ paddleOne, paddleTwo ];


// ball
var ball = new THREE.Mesh(new THREE.SphereGeometry(BALL.radius, BALL.segments, BALL.segments), new THREE.MeshLambertMaterial({color: 'white', transparent: true}));
ball.castShadow = true;
ball.position.y = BALL.radius / 2;
scene.add(ball);

// hit the lights!
var ambientLight = new THREE.AmbientLight(0x353535);
scene.add(ambientLight);
var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.castShadow = true;
directionalLight.position.set(1, 1, 1).normalize();
directionalLight.position.z = 20;
directionalLight.position.y = 100;
scene.add(directionalLight);

animate();

}, 150);