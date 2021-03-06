const io = require('socket.io')({cors: {origin: "*", methods: ['GET', 'POST']}});
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { makeid } = require('./utils');
const { FRAME_RATE } = require('./constants');

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('keydown', handleKeyDown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('play', handlePlay);

    function handleJoinGame(gameCode) {
        //const room = io.sockets.adapter.rooms[gameCode];
        // let allUsers;
        // if (room) {
        //     allUsers = room.sockets;
        // }
        //
        // let numClients = 0;
        // if (allUsers) {
        //     numClients = Object.keys(allUsers).length;
        // }

        let clients = io.sockets.adapter.rooms.get(gameCode);

        let numClients = 0;
        if (clients) {
            numClients = io.sockets.adapter.rooms.get(gameCode).size;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        }
        else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = gameCode;
        client.emit('gameCode', gameCode);

        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2)

        io.sockets.in(gameCode)
            .emit('playerJoined', numClients + 1);

    }

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeyDown(key) {
        const roomName = clientRooms[client.id];

        if (!state[roomName]) {
            return;
        }

        if (!roomName) {
            return;
        }

        const vel = getUpdatedVelocity(key);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }


    function handlePlay() {
        const gameCode = clientRooms[client.id];

        io.sockets.in(gameCode)
            .emit('gameStarted');

        startGameInterval(gameCode);
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE)
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);