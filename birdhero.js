
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
var sprite = new Image();
sprite.src = "sprites.png";
var bird_anim = {};
bird_anim.flap = [];
bird_anim.normal = [];
bird_anim.flap.push({x:223, y:124});
bird_anim.normal.push({x:264, y:90});


//our winged protagonist 
var bird = {
    x: width/4,
    y: height/2 - 50,
    width: 80,
    height: 50,
    sprite_width: 16,
    sprite_height: 11,
    flap: 9,
    speed: 9.8,
    velY: 0.8,
    flap_frames: 0
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
    this.img_width = 26;
    this.img_height = 135;
}

////////////////////////////controls////////////////////////////
var keys = [];

canvas.addEventListener("click", function (e) {
    bird.velY = -bird.flap;
    bird.flap_frames = 5;
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
	bird.y = height/2 - 50;
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
        //old way
		//ctx.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
		//ctx.fillRect(walls[i].x, walls[i].y2, walls[i].width, walls[i].h2);
        //new way
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.drawImage(sprite,
            302, 0, walls[i].img_width, walls[i].img_height,
            walls[i].x, walls[i].y + walls[i].height - height , walls[i].width, height); //little ugly but prevents squishing of image
        ctx.drawImage(sprite,
            330,0, walls[i].img_width, walls[i].img_height,
            walls[i].x, walls[i].y2, walls[i].width, height);
	}
	}

    //score board
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.font = 80 + "pt Times New Roman";
    ctx.strokeText(score, width/2, 90);
    ctx.fillText(score, width/2, 90);
    
    ////old way
    //ctx.fillStyle = "red";
    //ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    ////new way
    var anim_name = bird.flap_frames > 0 ? 'flap' : 'normal';
    var slice = bird_anim[anim_name][0];
    //ctx.imageSmoothingEnabled = false;
    //ctx.mozImageSmoothingEnabled = false;
    //ctx.webkitImageSmoothingEnabled = false;
    ctx.drawImage(sprite,
		slice.x,slice.y,bird.sprite_width,bird.sprite_height, //src
		bird.x,bird.y,bird.width,bird.height); //dst
		//slice.x,slice.y,64,64, //src
		//-player.w,-player.h,player.w*2,player.h*2); //dst
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
		window.setTimeout(gameOverScreen, 1000);
		}
	}
    }
    
    if (bird.velY < bird.speed) {
	bird.velY += gravity;
    }

    bird.y += bird.velY;
    
    if (bird.y > height - bird.height) {
	//bird.y = height - bird.height;
	//bird.velY = 0;
	//this bird can't land anymore
	gameOver = true;
	gameOverScreen();
    }
    if (bird.y < 0) {
	bird.y = 0;
	bird.velY = 0;
    }
    
    bird.flap_frames = bird.flap_frames > 0 ? bird.flap_frames - 1 : 0;
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