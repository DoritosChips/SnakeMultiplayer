const { GRID_SIZE } = require('./constants')

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState();
    randomApple(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        }, {
            pos: {
                x: 3,
                y: 11,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                {x: 1, y: 11},
                {x: 2, y: 11},
                {x: 3, y: 11},
            ],
            }],
        apple: {},
        gridsize: GRID_SIZE,
    }
}

function gameLoop(state) {
    if (!state) {
         return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2;
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1;
    }

    if (state.apple.x === playerOne.pos.x && state.apple.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomApple(state);
    }

    if (state.apple.x === playerTwo.pos.x && state.apple.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomApple(state);
    }

    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1;
            }
        }
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;
}

function randomApple(state) {
    let apple = {
        x : Math.floor(Math.random() * GRID_SIZE),
        y : Math.floor(Math.random() * GRID_SIZE),
    }

    for (let cell of state.players[0].snake) {
        if (cell.x === apple.x && cell.y === apple.y) {
            return randomApple(state);
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x === apple.x && cell.y === apple.y) {
            return randomApple(state);
        }
    }

    state.apple = apple;
}

function getUpdatedVelocity(key) {
    switch (key) {
        case 'a': {
            return {x: -1, y: 0}
        }
        case 's': {
            return {x: 0, y: 1}
        }
        case 'd': {
            return {x: 1, y: 0}
        }
        case 'w': {
            return {x: 0, y: -1}
        }
    }
}