function render(context, state){

	// clear canvas
	context.clearRect(
		state.table.x,
		state.table.y,
		state.table.width,
		state.table.height
	);

	// pong table
	context.fillStyle = "#000";
	context.fillRect(
		state.table.x,
		state.table.y,
		state.table.width,
		state.table.height
	);

	// scores
	context.fillStyle = "#fff";

	var fontSize = 60;
	context.font= fontSize + "px Arial";
	
	context.fillText(
		state.paddles[0].score,
		state.table.width / 4 - context.measureText(state.paddles[0].score).width / 2,
		state.table.height / 6
	);

	context.fillText(
		state.paddles[1].score,
		state.table.width / 4 * 3 - context.measureText(state.paddles[1].score).width / 2,
		state.table.height / 6
	);

	// ball

	context.fillRect(
		state.ball.x,
		state.ball.y,
		state.ball.width,
		state.ball.height
	);

	// paddles
	for (var key in state.paddles) {
		var paddle = state.paddles[key];
		context.fillRect(
			paddle.x,
			paddle.y,
			paddle.width,
			paddle.height
		);
	}

	// center line
	context.strokeStyle = "#fff";
	var lineWidth = 2;
	context.lineWidth = lineWidth;
	context.setLineDash([5, 10]);
	context.beginPath();
	context.moveTo(state.table.width / 2,0);
	context.lineTo(state.table.width / 2, state.table.height);
	context.closePath();
	context.stroke();

}

function doBoxesIntersect(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width
		&& rect1.x + rect1.width > rect2.x
		&& rect1.y < rect2.y + rect2.height
		&& rect1.height + rect1.y > rect2.y;
}

function getCollisionDirections(rect1, rect2) {
	var collisions = { // relative to rect1
		TOP: false,
		RIGHT: false,
		BOTTOM: false,
		LEFT: false
	};

	if(!doBoxesIntersect(rect1, rect2)){
		return collisions;
	}

	if ( rect1.y > rect2.y && rect1.y < rect2.y + rect2.height ) {
		collisions.TOP = true;
	}

	if ( rect1.y + rect1.height > rect2.y && rect1.y + rect1.height < rect2.y + rect2.height ) {
		collisions.BOTTOM = true;
	}

	if ( rect1.x < rect2.x + rect2.width && rect1.x > rect2.x) {
		collisions.LEFT = true;
	}

	if( rect1.x + rect1.width > rect2.x && rect1.x + rect1.width < rect2.x + rect2.width ){
		collisions.RIGHT = true;
	}

	return collisions;
}

function update(){
	state.ball.x += state.ball.directionX * state.ball.speed;
	state.ball.y += state.ball.directionY * state.ball.speed;

	// bot
	state.paddles[1].y = state.ball.y * 0.9;

	for (var key in state.paddles) {

		var paddleCollisions = getCollisionDirections(state.paddles[key], state.ball);

		if(paddleCollisions.TOP === true || paddleCollisions.BOTTOM === true){
			state.ball.directionY = -state.ball.directionY;
		}

		if(paddleCollisions.LEFT || paddleCollisions.RIGHT){
			state.ball.directionX = -state.ball.directionX;
		}

	}

	if(state.ball.x < 0){
		state.paddles[1].score++;
		state.ball = Object.assign({}, state.ball, state.defaultBallPosition);
		state.ball.directionX = -state.ball.directionX;
	}

	if(state.ball.x + state.ball.width > state.table.width){
		state.paddles[0].score++;
		state.ball = Object.assign({}, state.ball, state.defaultBallPosition);
		state.ball.directionX = -state.ball.directionX;
	}

	if(state.ball.y < 0){
		state.ball.y = 0;
		state.ball.directionY = -state.ball.directionY;
	}

	if(state.ball.y + state.ball.height > state.table.height){
		state.ball.y = state.table.height - state.ball.height;
		state.ball.directionY = -state.ball.directionY;
	}

	render(context, state);
	window.requestAnimationFrame(update);
}

function getInitialState(){

	var tableWidth = 800;
	var tableHeight = Math.ceil(tableWidth * 0.75);
	var ballSize = Math.ceil(tableWidth * 0.01);
	var paddleWidth = ballSize;
	var paddleHeight = Math.ceil(tableHeight * 0.075);

	return {
		defaultBallPosition: {
			x: Math.ceil(tableWidth / 2 - ballSize / 2),
			y: Math.ceil(tableWidth / 2 - ballSize / 2)
		},
		table: {
			x: 0,
			y: 0,
			width: tableWidth,
			height: tableHeight
		},
		ball: {
			x: Math.ceil(tableWidth / 2 - ballSize / 2),
			y: Math.ceil(tableHeight / 2 - ballSize / 2),
			width: ballSize,
			height: ballSize,
			directionX: 1,
			directionY: 1,
			speed: 5
		},
		paddles: {
			0: {
				x: Math.ceil(tableWidth / 2 * 0.3),
				y: Math.ceil(tableHeight / 2 - paddleHeight / 2),
				width: paddleWidth,
				height: paddleHeight,
				score: 0
			},
			1: {
				x: Math.ceil(tableWidth - tableWidth / 2 * 0.3),
				y: Math.ceil(tableHeight / 2 - paddleHeight / 2),
				width: paddleWidth,
				height: paddleHeight,
				score: 0
			}
		}
	};
}

var state = getInitialState();

var canvas = document.querySelector(".pong-table");

canvas.width = state.table.width;
canvas.height = state.table.height;

var context = canvas.getContext("2d");

var canvasPosition = canvas.getBoundingClientRect();

// allow player to control paddle with mouse
document.addEventListener("mousemove", function(event){
	state.paddles[0].y = Math.max(
		Math.min(
			event.pageY - canvasPosition.top, state.table.height - state.paddles[0].height
		),
		state.table.y
	);
});

window.requestAnimationFrame(update);