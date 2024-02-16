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
    context.fillStyle = "#000";
    context.fillRect(0,0, canvas.clientWidth, canvas.height);

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
    drawTetronimo(player.piece, player.position);
    requestAnimationFrame(update);
}

function fall(){
    player.position.y += 1;
    player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));
}

function rotatePiece(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
    return matrix;
}

function rotatePieceMirror(matrix){
    matrix = matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
    return matrix;
}

update();


