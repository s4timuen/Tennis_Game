// canvas
const CANVAS_START_X = 0;
const CANVAS_START_Y = 0;
const CANVAS_COLOR = "black";
var canvas;
var canvasContext;

// ball
const BALL_DIAMETER = 20;
const BALL_COLOR = "red";
const BALL_SPEED_START = 10;
var ballCoordinateX;
var ballCoordinateY;
var ballSpeedX;
var ballSpeedY;

// net
const NET_ELEMENT_EDGE_LENGTH = 5;
const NET_COLOR = "white";
var netCoordinateX;

// paddles
const PADDLES_WIDTH = 10;
const PADDLES_HEIGHT = 150;
const PADDLES_COLOR = "white";
const PADDLES_PADDING = 20;
const LEFT_PADDLE_COORDINATE_X = 0;
const RIGHT_PADDLE_SPEED_Y = 8.75;
var leftPaddleCoordinateY;
var rightPaddleCoordinateX;
var rightPaddleCoordinateY;

// players, scores, reset notice
const LEFT_PLAYER = "leftPlayer";
const RIGHT_PLAYER = "rightPlayer";
const TEXT_COLOR = "white";
var leftScore = 0;
var rightScore = 0;
var scoreTextCoordinateX;
var scoreTextCoordinateY;
var noticeTextCoordinateX;
var noticeTextCoordinateY;

// fps
const FPS = 60;

// onload
window.onload = function() {

    // get canvas
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");
    canvas.startX = CANVAS_START_X;
    canvas.startY = CANVAS_START_Y;
    canvas.color = CANVAS_COLOR;

    // get net, score and notice text position
    netCoordinateX = (canvas.width / 2) - (NET_ELEMENT_EDGE_LENGTH / 2);
    scoreTextCoordinateX = canvas.width / 2.15;
    scoreTextCoordinateY = canvas.height / 15;
    noticeTextCoordinateX = canvas.width / 2.25;
    noticeTextCoordinateY = canvas.height;

    // set right paddle coordinates and start ball
    rightPaddleCoordinateX = canvas.width - PADDLES_WIDTH;
    rightPaddleCoordinateY = canvas.startY;
    resetBall();

    try {
        // redraw canvas
        setInterval(function() {
            moveElements();
            drawCanvas();
        }, 1000/FPS);

        // mouse position listener
        canvas.addEventListener("mousemove", function(evt) {
            var mousePosition = getMousePosition(evt);
            leftPaddleCoordinateY = mousePosition.y - (PADDLES_HEIGHT / 2);
        });

        // reset game listener
        document.onkeydown = function(evt) {
            if(evt.key === "Escape") {
                leftScore = 0;
                rightScore = 0;
                resetBall();
            }
        }
    }
    catch(err) {
        console.log(err);
    }
}

// draw canvas
function drawCanvas() {

    // background
    drawRectangle(canvas.startX, canvas.startY, canvas.width, canvas.height, canvas.color);

    // left player paddle
    drawRectangle(LEFT_PADDLE_COORDINATE_X, leftPaddleCoordinateY, PADDLES_WIDTH, PADDLES_HEIGHT, PADDLES_COLOR);

    // right player paddle
    drawRectangle(rightPaddleCoordinateX, rightPaddleCoordinateY, PADDLES_WIDTH, PADDLES_HEIGHT, PADDLES_COLOR);

    // draw net
    drawNet();

    // text
    drawText(scoreTextCoordinateX, scoreTextCoordinateY, TEXT_COLOR, leftScore, rightScore); 

    // ball
    drawCircle(ballCoordinateX, ballCoordinateY, BALL_DIAMETER, BALL_COLOR);
}

// draw rectangle
function drawRectangle(coordinateX, coordinateY, width, height, color) {

    canvasContext.fillStyle = color;
    canvasContext.fillRect(coordinateX, coordinateY, width, height);
}

function drawNet() {

    for (var netCoordinateY = 0; netCoordinateY < canvas.height; netCoordinateY = netCoordinateY + (NET_ELEMENT_EDGE_LENGTH * 5)) {

        drawRectangle(netCoordinateX, netCoordinateY, NET_ELEMENT_EDGE_LENGTH, NET_ELEMENT_EDGE_LENGTH, NET_COLOR);
    }
}

// draw circle
function drawCircle(coordinateX, coordinateY, diameter, color) {

    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(coordinateX, coordinateY, diameter, diameter, Math.PI * 2, true);
    canvasContext.fill();
}

// draw text
function drawText(coordinateX, coordinateY, color, leftScore, rightScore) {
    canvasContext.fillStyle = color;
    canvasContext.fillText("ESC to reset game.", noticeTextCoordinateX, noticeTextCoordinateY);
    canvasContext.fillText(`Score: ${leftScore} to ${rightScore}`, coordinateX, coordinateY);
}

// get mouse position
function getMousePosition(evt) {

    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseCoordinateX = evt.clientX - rect.left - root.scrollLeft;
    var mouseCoordinateY = evt.clientY - rect.top - root.scrollTop;

    return {
        x: mouseCoordinateX,
        y: mouseCoordinateY
    }
}

// computer movement paddle
function computerMovement() {

    if((rightPaddleCoordinateY + (PADDLES_HEIGHT / 2)) <= (ballCoordinateY + (BALL_DIAMETER / 2) - PADDLES_PADDING)) {

        rightPaddleCoordinateY = rightPaddleCoordinateY + RIGHT_PADDLE_SPEED_Y;
    }
    
    if((rightPaddleCoordinateY + (PADDLES_HEIGHT / 2)) > (ballCoordinateY + (BALL_DIAMETER / 2) + PADDLES_PADDING)) {

        rightPaddleCoordinateY = rightPaddleCoordinateY - RIGHT_PADDLE_SPEED_Y;
    }
}

// move elements
function moveElements() {

    // right paddle
    computerMovement();

    var deltaY; 

    // move ball X coordinate and angle of reflection 
    // collision left paddle
    if(ballCoordinateX <= canvas.startX) {
       
        if((ballCoordinateY + BALL_DIAMETER / 2 > leftPaddleCoordinateY) && (ballCoordinateY + BALL_DIAMETER / 2 < leftPaddleCoordinateY + PADDLES_HEIGHT)) {

            ballSpeedX = -ballSpeedX;
            deltaY = getBallPaddleDelta(ballCoordinateY, leftPaddleCoordinateY); 
            ballSpeedY = deltaY * 0.2; 

        } else {
            resetBall();
            countScore(RIGHT_PLAYER);
        }
    }

    // collision right paddle
    if(ballCoordinateX >= canvas.width - BALL_DIAMETER) {

        if((ballCoordinateY + BALL_DIAMETER / 2 > rightPaddleCoordinateY) && (ballCoordinateY + BALL_DIAMETER / 2 < rightPaddleCoordinateY + PADDLES_HEIGHT)) {

            ballSpeedX = -ballSpeedX;
            deltaY = getBallPaddleDelta(ballCoordinateY, rightPaddleCoordinateY); 
            ballSpeedY = deltaY * 0.2; 

        } else {
            resetBall();
            countScore(LEFT_PLAYER);
        }
    } 

    ballCoordinateX = ballCoordinateX + ballSpeedX;

    // collision ball y edges
    if(ballCoordinateY >= canvas.height - BALL_DIAMETER || ballCoordinateY <= canvas.startY) {
       
        ballSpeedY = -ballSpeedY;
    }

    ballCoordinateY = ballCoordinateY + ballSpeedY;
}

// reset ball 
function resetBall() {

    ballCoordinateX = canvas.width / 2;
    ballCoordinateY = canvas.height / 2;
    ballSpeedX = (Math.round(Math.random()) * 2 - 1) * BALL_SPEED_START;
    ballSpeedY = (Math.round(Math.random()) * 2 - 1) * BALL_SPEED_START;
}

// count score
function countScore(player) {

    if(player == LEFT_PLAYER) {

        leftScore++;
    }
    if(player == RIGHT_PLAYER) {

        rightScore++;
    }
}

// get delta ball center to paddle center
function getBallPaddleDelta(ballCoordinateY, paddleCoordinateY) {

    return (ballCoordinateY + (BALL_DIAMETER / 2)) - (paddleCoordinateY + (PADDLES_HEIGHT / 2));
}
