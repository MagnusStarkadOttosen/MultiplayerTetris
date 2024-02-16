const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20,20);

document.addEventListener("keydown", event => {
    if(event.key === "ArrowLeft" || event.key === "a"){
        player.position.x -= 1;
    } else if(event.key === "ArrowRight" || event.key === "d"){
        player.position.x += 1;
    } else if(event.key === "ArrowDown" || event.key === "s"){
        player.position.y += 1;
    } else if(event.key === "ArrowUp" || event.key === "w"){
        player.position.y -= 1;
    } else if(event.key === "q"){
        player.piece = rotatePieceMirror(player.piece);
    } else if(event.key === "e"){
        player.piece = rotatePiece(player.piece);
    }

    player.position.x = Math.max(0, Math.min(player.position.x, gameBoard.width - getTetrominoWidth(player.piece)));
    player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));

})

//Tetronimo = T L J S Z O I
function getTetronimo(piece){
    let result;
    switch(piece){
        case "T":
            result = [
                [1, 1, 1],
                [0, 1, 0],
            ];
            break;
        case "L":
            result = [
                [1, 0],
                [1, 0],
                [1, 1],
            ];
            break;
        case "J":
            result = [
                [0, 1],
                [0, 1],
                [1, 1],
            ];
            break;
        case "S":
            result = [
                [0, 1, 1],
                [1, 1, 0],
            ];
            break;
        case "Z":
            result = [
                [1, 1, 0],
                [0, 1, 1],
            ];
            break;
        case "O":
            result = [
                [1, 1],
                [1, 1],
            ];
            break;
        case "I":
            result = [
                [1],
                [1],
                [1],
                [1],
            ];
            break;
        default:
            throw new Error("Invalid Tetromino type!");
    }
    return result;
}

function getTetrominoWidth(matrix) {
    return matrix[0].length;
}

function getTetrominoHeight(matrix) {
    return matrix.length;
}

function drawTetronimo(piece, offset){
    //context.fillStyle = "#000";
    //context.fillRect(0,0, canvas.clientWidth, canvas.height);

    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                context.fillStyle = "red";
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

const player = {
    position: {x: 5, y: 5},
    piece: null,
    pieceType: "T",
}

const gameBoard = {
    width: 10,
    height: 20,
    grid: []
};

function initializeGameBoard() {
    for (let row = 0; row < gameBoard.height; row++) {
        gameBoard.grid[row] = new Array(gameBoard.width).fill(0);
    }
}

function updatePlayerPiece(piece){
    if(player.piece === null){
        player.piece = getTetronimo(piece);
    }
}

let lastFall = 0;
const fallInterval = 1000;

function update(time = 0){
    if(!lastFall) lastFall = time;
    const deltaTime = time - lastFall;

    if (deltaTime > fallInterval) {
        fall();
        lastFall = time;
    }
    updatePlayerPiece(player.pieceType);
    //drawTetronimo(player.piece, player.position);
    drawGameBoard();
    requestAnimationFrame(update);
}

function fall(){
    player.position.y += 1;
    if(pieceCollided()){
        player.position.y -= 1;
        freezePiece();
        spawnNewPiece();
    }
    //player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));
}

function rotatePiece(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
    return matrix;
}

function rotatePieceMirror(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
    return matrix;
}

function pieceCollided() {
    for (let y = 0; y < player.piece.length; y++) {
        for (let x = 0; x < player.piece[y].length; x++) {
            if (player.piece[y][x] !== 0) {
                let boardX = player.position.x + x;
                let boardY = player.position.y + y;

                // Check if the piece is outside the game board horizontally or has reached the bottom
                if (boardX < 0 || boardX >= gameBoard.width || boardY >= gameBoard.height) {
                    return true;
                }

                // Prevent accessing gameBoard.grid[boardY] if boardY is out of bounds
                // This also implicitly checks if boardY is below the bottom of the game board
                if (boardY < 0 || !gameBoard.grid[boardY] || gameBoard.grid[boardY][boardX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function freezePiece(){
    player.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                gameBoard.grid[y + player.position.y][x + player.position.x] = value;
            }
        });
    });
    //TODO: check for completed lines.
}

function spawnNewPiece(){
    player.pieceType = getRandomPieceType();
    player.piece = getTetronimo(player.pieceType);
    player.position = {x: 5, y: 5};
}

const tetrominoTypes = ["T", "L", "J", "S", "Z", "O", "I"];
function getRandomPieceType() {
    const index = Math.floor(Math.random() * tetrominoTypes.length);
    return tetrominoTypes[index];
}

function drawGameBoard() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.clientWidth, canvas.height);

    // Draw the static pieces
    gameBoard.grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "red";
                context.fillRect(x, y, 1, 1);
            }
        });
    });

    // Draw the moving piece
    if (player.piece) {
        drawTetronimo(player.piece, player.position);
    }
}

initializeGameBoard();
update();


