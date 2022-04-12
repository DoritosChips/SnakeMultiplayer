const BG_COLOR = 'black';
const SNAKE_COLORS = ['green', 'blue'];
const APPLE_COLOR = 'red';

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
}

const socket = io('127.0.0.1:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 800;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown)

    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.key);
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const apple = state.apple;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = APPLE_COLOR;
    ctx.fillRect(apple.x * size, apple.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLORS[0]);
    paintPlayer(state.players[1], size, SNAKE_COLORS[1]);
}

function paintPlayer(playerState, size, color) {
    const snake = playerState.snake;

    ctx.fillStyle = color;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
    init();
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);

    if (data.winner === playerNumber) {
        alert('You win!');
    } else {
        alert('You lose!');
    }

    gameActive = false;
    reset();
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert('Unknown game code');
}

function handleTooManyPlayers() {
    reset();
    alert('This game has already started');
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none';
}