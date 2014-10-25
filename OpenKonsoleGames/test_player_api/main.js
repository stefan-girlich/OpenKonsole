// const
var colorNorm = '#00f',
    colorRaw = '#f00',
    // relative inner square size; resolved Pythagoras equation for a=b=1
    innerSquareRel = Math.sqrt(0.5);

var el_canvas = document.getElementById('stage'),
    ctx = el_canvas.getContext('2d'),
    canvasWidth = el_canvas.width,
    canvasHeight = el_canvas.height,
    canvasCenter = canvasWidth / 2;
    innerSquareSize = canvasWidth * innerSquareRel;
    markerSize = 4;

var el_pos = document.getElementById('pos_out');
var el_pos_raw = document.getElementById('pos_out_raw');


// store input values
var markerPosAbs = {x: 0, y: 0},
    markerRawPosAbs = {x: 0, y: 0};


drawScale();
drawMarker(0, 0, colorRaw);


var stage = document.querySelector('#game_frame');

var players = playerSrv.getPlayers();
var playerKeys = Object.keys(players);
var domPlayers = {};
for(var i=0; i<playerKeys.length; i++) {
    var domPlayer = new DOMPlayerInfo();
    domPlayer.setPlayerID(i);
    domPlayers[i] = domPlayer;
    stage.appendChild(domPlayer.el);

    players[i].on('connected', onConnected);
    players[i].on('disconnected', onDisconnected);
    players[i].on('stickPositionChangedRaw', onStickPositionChangedRaw);
    players[i].on('stickPositionChanged', onStickPositionChanged);
    players[i].on('buttonChanged', onButtonChanged);
}



function onConnected(playerInstance) {
    domPlayers[playerInstance.getID()].setConnected(true);
}

function onDisconnected(playerInstance) {
    domPlayers[playerInstance.getID()].setConnected(false);
}


function onStickPositionChangedRaw(playerInstance, stickPos) {

    markerRawPosAbs.x = canvasCenter + (canvasCenter * stickPos.x * 2);
    markerRawPosAbs.y = canvasCenter + (canvasCenter * stickPos.y * -2);
    drawAll();


    domPlayers[playerInstance.getID()].setPosRaw(stickPos.x, stickPos.y);
}

function onStickPositionChanged(playerInstance, stickPos) {

    markerPosAbs.x = canvasCenter + ((innerSquareSize / 2) * stickPos.x * 2);
    markerPosAbs.y = canvasCenter + ((innerSquareSize / 2) * stickPos.y * -2);
    drawAll();

    domPlayers[playerInstance.getID()].setPos(stickPos.x, stickPos.y);
}

function onButtonChanged(playerInstance, buttonID, isDown) {
    domPlayers[playerInstance.getID()].setButtonDown(buttonID, isDown);
}


function drawAll() {
    drawScale();
    drawMarker(markerPosAbs.x, markerPosAbs.y, colorNorm);
    drawMarker(markerRawPosAbs.x, markerRawPosAbs.y, colorRaw);
}

function drawScale() {

    // background + border
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // outer circle = raw input boundary
    ctx.fillStyle = null;
    ctx.strokeStyle = '#bbb';
    ctx.beginPath();
    ctx.arc(canvasCenter, canvasCenter, canvasCenter, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();


    // inner square = normalized input boundary
    ctx.strokeRect(canvasCenter - innerSquareSize / 2, canvasCenter - innerSquareSize / 2, innerSquareSize, innerSquareSize);

    // center lines
    ctx.beginPath();
    ctx.moveTo(canvasCenter, 0);
    ctx.lineTo(canvasCenter, canvasHeight);
    ctx.moveTo(0, canvasCenter);
    ctx.lineTo(canvasWidth, canvasCenter);
    ctx.stroke();
    ctx.closePath();
}

function drawMarker(absX, absY, color) {

    ctx.fillStyle = color;
    ctx.strokeStyle = null;
    ctx.fillRect(absX - markerSize / 2, absY - markerSize / 2, markerSize, markerSize);
}

function DOMPlayerInfo() {

    var el = document.querySelector('[template].player_info').cloneNode(true);
    el.removeAttribute('template');

    this.el = el;

    this.setPlayerID = function(playerId) {
        el.querySelector('.player_id').innerHTML = playerId;
    }

    this.setConnected = function(connected) {
        var el_title = el.querySelector('.player_id');
        var classes = el_title.className.split(' ');
        if(connected) {
            el_title.className += ' connected';
        }else {
            var res = [];
            for(var i=0; i<classes.length; i++) {
                if(classes[i] !== 'connected') {
                    res.push(classes[i]);
                }           }
            el_title.className = res.join(' ');
        }
    }

    this.setPos = function(x, y) {
        el.querySelector('.pos_x').innerHTML = Math.round(x * 10000) / 10000;
        el.querySelector('.pos_y').innerHTML = Math.round(y * 10000) / 10000;
    }

    this.setPosRaw = function(x, y) {
        el.querySelector('.pos_x_raw').innerHTML = Math.round(x * 10000) / 10000;
        el.querySelector('.pos_y_raw').innerHTML = Math.round(y * 10000) / 10000;
    }

    this.setButtonDown = function(btnId, down) {
        var el_btn = el.querySelector('.btn.btn' + btnId);
        var classes = el_btn.className.split(' ');
        if(down) {
            el_btn.className += ' down';
        }else {
            var res = [];
            for(var i=0; i<classes.length; i++) {
                if(classes[i] !== 'down') {
                    res.push(classes[i]);
                }
            }
            el_btn.className = res.join(' ');
        }
    }

}