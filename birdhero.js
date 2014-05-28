
////////////////////////////globals////////////////////////////
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = 1300;
var height = 600;
canvas.width = width;
canvas.height = height;

var gameOver = false;
var started = false;
var menuTxtY = 0;
var gravity = 0.5;
var holeSize = 175;
var walls = [];
var score = 0;

//our winged protagonist 
var bird = {
	x: width/4,
	y: height/2 - 50,
	width: 80,
	height: 50,
	flap: 9,
	speed: 9.8,
	velY: 0.8,
	//angle: 0
};

//the spooky walls
function wall(x, y){
	this.x = x;
	this.y = y;
	this.width = 140;
	this.height = Math.random() * (height - holeSize*2) +100;
	this.y2 = this.height + holeSize;
	this.h2 = height - this.y2;
	this.speed = 5;
	this.gone = false;
	this.passed = false;
}

////////////////////////////controls////////////////////////////
var keys = [];

canvas.addEventListener("click", function (e) {
	bird.velY = -bird.flap;
	if (!started) {
		started = true;
	}
});

document.addEventListener('keydown', function (e) {
	keys[e.keyCode] = true;
	if (13 in keys && gameOver) {
		//reset EVERYTHING
		started = false;
		gameOver = false;
		menuTxtY = 0;
		walls = [];
		score = 0;
		menu();
	}
});

document.addEventListener('keyup', function (e) {
	delete keys[e.keyCode];
});


////////////////////////////loads the game////////////////////////////
var main = function() {
	draw();
	update();

	if (!gameOver && started) {
		requestAnimationFrame(main);
	}
};

window.onload = function() {
	if (!started) {
		menu();
	}
};

/////////////////////////////////main mechanics////////////////////////////////
var draw = function() {
	ctx.clearRect(0,0,width,height);

	ctx.fillStyle = "blue";
	for (var i = 0; i < walls.length; i++) {
		if (!walls[i].gone) {
			ctx.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
			ctx.fillRect(walls[i].x, walls[i].y2, walls[i].width, walls[i].h2);
		}
	}

	//score board
	ctx.fillStyle = "white";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 8;
	ctx.font = 80 + "pt Times New Roman";
	ctx.strokeText(score, width/2, 90);
	ctx.fillText(score, width/2, 90);

	//temp half circle representation
	// ctx.beginPath();
	// ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width, (3*Math.PI)/2, Math.PI/2);
	// ctx.strokeStyle = "black";
	// ctx.stroke();
	// ctx.closePath();

	ctx.fillStyle = "red";
	ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
};

var update = function() {
	//if no walls created yet or the last created wall has moved past the middle of the screen
	if (walls.length === 0 || walls[walls.length - 1].x < width/2) {
		walls.push(new wall(width, 0));
	}
	//add to score
	if (walls.length > 1 && bird.x > walls[walls.length - 2].x + walls[walls.length - 2].width && !walls[walls.length - 2].passed) {
		score++;
		walls[walls.length - 2].passed = true;
	}

	for (var i = 0; i < walls.length; i++) {
		//if wall moves of screen, then it's gone
		if (walls[i].x < -walls[i].width) {
			walls[i].gone = true;
		}
		//only walls still on screen get updated
		if (!walls[i].gone) {
			walls[i].x -= walls[i].speed;

			if (colisionDetection(bird, walls[i])) {
				gameOver = true;
				gameOverScreen();
			}
		}
	}

	if (bird.velY < bird.speed) {
		bird.velY += gravity;
	}

	bird.y += bird.velY;

	if (bird.y > height - bird.height) {
		bird.y = height - bird.height;
		bird.velY = 0;
	}
	if (bird.y < 0) {
		bird.y = 0;
		bird.velY = 0;
	}
};

var colisionDetection = function(bird, rectangle) {
	//check top wall collision
	var vx = (bird.x + (bird.width/2)) - (rectangle.x + (rectangle.width/2));
	var vy = (bird.y + (bird.height/2)) - (rectangle.y + (rectangle.height/2));
	var halfWidth = (bird.width/2) + (rectangle.width/2);
	var halfHeight = (bird.height/2) + (rectangle.height/2);
	
	if (Math.abs(vx) < halfWidth && Math.abs(vy) < halfHeight) {
		return true;
	}
	else {
		//check wall 2
		vx = (bird.x + (bird.width/2)) - (rectangle.x + (rectangle.width/2));
		vy = (bird.y + (bird.height/2)) - (rectangle.y2 + (rectangle.h2/2));
		halfWidth = (bird.width/2) + (rectangle.width/2);
		halfHeight = (bird.height/2) + (rectangle.h2/2);

		if (Math.abs(vx) < halfWidth && Math.abs(vy) < halfHeight) {
			return true;
		}
		//nothing collided
		return false;
	}
};

var menu = function() {
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = "black";
	ctx.font = 100 + "pt Times New Roman";
	ctx.fillText("Bird Hero", width/2 - 250, menuTxtY);
	ctx.font = 50 + "pt Times New Roman";
	ctx.fillText("Click to start!", width/2 - 150, menuTxtY + 60);
	if (menuTxtY < height/2) {
		menuTxtY += 5;
	}
	if (!started) {
		requestAnimationFrame(menu);
	}
	else{
		main();
	}
};

var gameOverScreen = function() {
	ctx.clearRect(0,0,width,height);
	ctx.fillStyle = "black";
	ctx.font = 100 + "pt Times New Roman";
	ctx.fillText("Game Over", width/2 -250, height/2);
	ctx.font = 50 + "pt Times New Roman";
	ctx.fillText("Final Score: " + score, width/2 - 125, height/2 + 65);
	ctx.font = 40 + "pt Times New Roman";
	ctx.fillText("Press enter to reset", width/2 - 140, height/2 +130);
	if (gameOver) {
		requestAnimationFrame(gameOverScreen);
	}
};