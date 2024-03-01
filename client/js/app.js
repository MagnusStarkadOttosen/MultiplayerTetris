const canvas = document.getElementById('tetris');
const canvas2 = document.getElementById('hold');
const canvas3 = document.getElementById('preview');

const context = canvas.getContext('2d');
const context2 = canvas2.getContext('2d');
const context3 = canvas3.getContext('2d');


context.scale(20,20);
context2.scale(20,20);
context3.scale(20,20);

heldPiece= null;

holdBoolean=0


document.addEventListener("keydown", event => {
    if(event.key === "ArrowLeft" || event.key === "a"){
        player.position.x -= 1;
    } else if(event.key === "ArrowRight" || event.key === "d"){
        player.position.x += 1;
    } else if(event.key === "ArrowDown" || event.key === "s"){
     fall()
    } else if(event.key === "q"){
        player.piece = rotatePieceMirror(player.piece);
        // shadow.piece = rotatePieceMirror(shadow.piece)

    } else if(event.key === "e" || event.key === "ArrowUp"){
        player.piece = rotatePiece(player.piece);
        // shadow.piece = rotatePiece(shadow.piece)
    }
    else if(event.key === " "){
        instantDrop();

    }
    else if(event.key === "c" && holdBoolean==0){
        holdPiece(player.piece);

    }

    player.position.x = Math.max(0, Math.min(player.position.x, gameBoard.width - getTetrominoWidth(player.piece)));
    player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));

})

//Tetronimo = T L J S Z O I
function getTetromino(piece){
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
                [2, 0],
                [2, 0],
                [2, 2],
            ];
            break;
        case "J":
            result = [
                [0, 3],
                [0, 3],
                [3, 3],
            ];
            break;
        case "S":
            result = [
                [0, 4, 4],
                [4, 4, 0],
            ];
            break;
        case "Z":
            result = [
                [5, 5, 0],
                [0, 5, 5],
            ];
            break;
        case "O":
            result = [
                [6, 6],
                [6, 6],
            ];
            break;
        case "I":
            result = [
                [7],
                [7],
                [7],
                [7],
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

function instantDrop() {
    while (!pieceCollided(player.piece,player.position)) {
        player.position.y += 1;
    }
    player.position.y -= 1;
    freezePiece();
    spawnNewPiece();


}

function dropShadow(){
    shadow.piece = []
    for (let i = 0; i < player.piece.length; i++)
        shadow.piece[i] = player.piece[i].slice();
    shadow.position =  {x:player.position.x,y:player.position.y}

    while(!pieceCollided(shadow.piece,shadow.position)){
        shadow.position.y ++

    }
    shadow.position.y--
    shadow.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){

                    shadow.piece[y][x] = 8}})})
    drawTetromino(shadow.piece,shadow.position);

}


function drawTetromino(piece, offset,ctx){
    //context.fillStyle = "#000";
    //context.fillRect(0,0, canvas.clientWidth, canvas.height);

    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                if(value === 1){
                     ctx.fillStyle = "red";
                } else if(value === 2){
                    ctx.fillStyle = "blue";
                } else if(value === 3){
                    ctx.fillStyle = "green";
                } else if(value === 4){
                    ctx.fillStyle = "yellow";
                } else if(value === 5){
                    ctx.fillStyle = "orange";
                } else if(value === 6){
                    ctx.fillStyle = "cyan";
                } else if(value === 7){
                    ctx.fillStyle = "pink";
                }else if(value === 8){
                    ctx.fillStyle = "grey";
                }
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

const player = {
    position: {x: 4, y: 0},
    piece: null,
    pieceType: "T",
}
const nextPiece = {
    position: {x: 5, y: 5},
    piece: null,
    pieceType: "T",
}

const shadow = {
    position: {x: player.position.x, y: player.position.y},
    piece: null,
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

function updatePlayerPiece(pieceType){
    if(player.piece === null){
        player.piece = getTetromino(pieceType);
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
    console.log(player.pieceType)
    updatePlayerPiece(player.pieceType);
    //drawTetronimo(player.piece, player.position);
    drawGameBoard();
    requestAnimationFrame(update);
}

function fall(){
    player.position.y += 1;
    if(pieceCollided(player.piece,player.position)){
        player.position.y -= 1;
        freezePiece();


        spawnNewPiece(nextPiece);
    }
    //player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));
}
function holdPiece(matrix){
    if(heldPiece==null) {
        heldPiece = matrix
        drawHeldPiece(matrix)




        spawnNewPiece(nextPiece)

    }
    else{
        player.piece=heldPiece

        heldPiece=null
        clearCanvas(context2)
    }
    holdBoolean=1
}

function rotatePiece(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
    return matrix;
}

function rotatePieceMirror(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
    return matrix;
}

function pieceCollided(piece,position) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x] !== 0) {
                let boardX = position.x + x;
                let boardY = position.y + y;

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

    player.piece = nextPiece.piece
    player.position=nextPiece.position
    player.pieceType=nextPiece.pieceType

    nextPiece.pieceType = getRandomPieceType();
    nextPiece.piece = getTetronimo(player.pieceType);
    nextPiece.position = {x: 6-player.piece[0].length, y: 0};
    holdBoolean=0

    clearCanvas(context3)
    drawPreviewPiece(nextPiece.piece)

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
            if(value !== 0){
                if(value === 1){
                    context.fillStyle = "red";
                } else if(value === 2){
                    context.fillStyle = "blue";
                } else if(value === 3){
                    context.fillStyle = "green";
                } else if(value === 4){
                    context.fillStyle = "yellow";
                } else if(value === 5){
                    context.fillStyle = "orange";
                } else if(value === 6){
                    context.fillStyle = "cyan";
                } else if(value === 7){
                    context.fillStyle = "pink";
                }
                context.fillRect(x, y, 1, 1);
            }
        });
    });

    // Draw the moving piece
    if (player.piece) {
        drawTetromino(player.piece, player.position);
        dropShadow();
    }
}
function clearCanvas(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
function drawHeldPiece(matrix){

    drawTetronimo(matrix,{x: 2, y: 2},context2)
}

function drawPreviewPiece(matrix){
    drawTetronimo(matrix,{x: 2, y: 2},context3)
}

initializeGameBoard();


update();


