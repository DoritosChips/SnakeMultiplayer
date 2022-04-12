const BG_COLOR = 'black';
const SNAKE_COLORS = ['green', 'blue'];
const APPLE_COLOR = 'red';

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const playButton = document.getElementById('playButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const playersConnectedDisplay = document.getElementById('playersConnectedDisplay');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);
playButton.addEventListener('click', play);

function newGame() {
    socket.emit('newGame');
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
}

function play() {
    const code = gameCodeDisplay.value;
    socket.emit('play', code);
}

const socket = io('https://limitless-brushlands-29107.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('playerJoined', handlePlayerJoined);
socket.on('gameStarted', handleGameStarted);

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = 'none';
    lobbyScreen.style.display = 'block';

    playersConnectedDisplay.innerText = '1';

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
    alert('The lobby if full');
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    lobbyScreen.style.display = 'none';
    playButton.style.display = 'none';
}

function handlePlayerJoined(numPlayers) {
    if (numPlayers > 1 && playerNumber === 1) {
        playButton.style.display = 'block';
    }
    playersConnectedDisplay.innerText = numPlayers;
}

function handleGameStarted() {
    lobbyScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}
