
const canvas = document.getElementById('tetris');
const canvas2 = document.getElementById('hold');
const canvas3 = document.getElementById('preview');

const context = canvas.getContext('2d');
const context2 = canvas2.getContext('2d');
const context3 = canvas3.getContext('2d');


context.scale(20,20);
context2.scale(20,20);
context3.scale(20,20);

const gameBoard = {
    width: 10,
    height: 20,
    grid: []
};


heldPiece= null;

holdBoolean=0

//

document.addEventListener("keydown", event => {
    if(event.key === "ArrowLeft" || event.key === "a"){
        player.position.x -= 1;
        if(pieceCollided(player.piece,player.position)){
            player.position.x++
        }
    } else if(event.key === "ArrowRight" || event.key === "d"){
        player.position.x += 1;
        if(pieceCollided(player.piece,player.position)){
            player.position.x--
        }
    } else if(event.key === "ArrowDown" || event.key === "s"){
     fall()
    } else if(event.key === "q"){
        player.piece = rotatePieceMirror(player.piece);
        if(pieceCollided(player.piece,player.position)) {
            player.piece = rotatePiece(player.piece);
        }
            // shadow.piece = rotatePieceMirror(shadow.piece)

    } else if(event.key === "e" || event.key === "ArrowUp"){
        player.piece = rotatePiece(player.piece);
        if(pieceCollided(player.piece,player.position)) {
            player.piece = rotatePieceMirror(player.piece);}

            // shadow.piece = rotatePiece(shadow.piece)
    }
    else if(event.key === " "){
        console.log(queue)
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
                [0, 1, 0],
                [1, 1, 1],
            ];
            break;
        case "L":
            result = [

                [0,0,2],
                [2,2,2]
            ];
            break;
        case "J":
            result = [

                [3,0,0],
                [3,3,3]
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
                [0,6, 6],
                [0,6, 6],
            ];
            break;
        case "I":
            result = [
              [7,7,7,7]
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
    spawnNewPiece(queue.shift());
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
    drawTetromino(shadow.piece,shadow.position,context);

}
function drawBlock(x,y,value,offset,ctx){
    let gradient = ctx.createLinearGradient(
        x+offset.x,
        y+offset.y,
        x+offset.x+1, 
        y+offset.y+1);
    if(value === 1){
        gradient.addColorStop(1, '#FF6347');
        gradient.addColorStop(0, '#8B0000');
          ctx.fillStyle = "red";
    } else if(value === 2){
        ctx.fillStyle = "blue";
        gradient.addColorStop(1, '#87CEFA');
        gradient.addColorStop(0, '#00008B');
        
    } else if(value === 3){
        ctx.fillStyle = "green";
        gradient.addColorStop(1, '#90EE90');
        gradient.addColorStop(0, '#006400');
        
    } else if(value === 4){
        ctx.fillStyle = "yellow";
        gradient.addColorStop(1, '#FFFF99');
        gradient.addColorStop(0, '#CCCC00');
        
    } else if(value === 5){
        ctx.fillStyle = "orange";
        gradient.addColorStop(1, '#FFBD45');
        gradient.addColorStop(0, '#FF8C00');
        
    } else if(value === 6){
        ctx.fillStyle = "cyan";
        gradient.addColorStop(1, '#E0FFFF');
        gradient.addColorStop(0, '#008B8B');
        
    } else if(value === 7){
        ctx.fillStyle = "purple";
        gradient.addColorStop(1, '#d8b0d1');
        gradient.addColorStop(0, '#6a0dad'); 
        
    }else if(value === 8){
        ctx.fillStyle = "grey";
        ctx.globalAlpha = 0.5;
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = "black";
}
// to player's peices
   

function drawTetromino(piece, offset,ctx){

   ctx.shadowOffsetX = 10; 
   ctx.shadowOffsetY = 10;
   ctx.shadowBlur = 15; 

    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                drawBlock(x,y,value,offset,ctx);
                
            }
        });
    });
}

const player = {
    position: {x:0,y:0},
    piece: null,
    pieceType: "T",
    gamePhase: 0,
    score:0,

}
const queue = []


const tempPiece ={
    position: {},
    piece: null,
    pieceType: "T",


}

const shadow = {
    position: {x: player.position.x, y: player.position.y},
    piece: null,
}



function initializeGameBoard() {
    for (let row = 0; row < gameBoard.height; row++) {
        gameBoard.grid[row] = new Array(gameBoard.width).fill(0);
    }
    randomPieceGenerator(player)
    for(let i = 0; i<=4;i++){
    randomPieceGenerator(tempPiece)
    queue.push({piece:tempPiece.piece,position:{x:tempPiece.position.x,y:tempPiece.position.y}})
}
    drawPreviewPiece()
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
    // console.log(player.pieceType)
    updatePlayerPiece(player.pieceType);
    //drawTetronimo(player.piece, player.position);
    drawGameBoard();
    requestAnimationFrame(update);
    checkFullLine()
}

function checkFullLine(){
    let checkArray = []
    gameBoard.grid.forEach((row, y) => {
    let check = true;
        row.forEach((value,x) =>{

    if(value === 0){
        check = false
    }

        })

        if(check){
            checkArray.push(y)
        }

    })

    removeFullLine(checkArray)
}
function chechTopLine(){
    if(gameBoard.grid[0][4]!=0 || gameBoard.grid[0][5]!=0 )
        return true
    else return false
}


function removeFullLine(removeArray){
removeArray = removeArray.toSorted()
for(let i = 0;i<removeArray.length;i++) {
    for (let i2 = removeArray[i]; i2 > 0; i2--) {

    gameBoard.grid[i2] = gameBoard.grid[i2-1].slice().fill(0);
    gameBoard.grid.unshift(row);
        y++;
        player.score +=rowCount*10;
        rowCount *=2;
    }
}
}

function fall(){
    player.position.y += 1;
    if(pieceCollided(player.piece,player.position)){
        player.position.y -= 1;
        freezePiece();


        spawnNewPiece(queue.shift());
    }
    //player.position.y = Math.min(player.position.y, gameBoard.height - getTetrominoHeight(player.piece));
}
function randomPieceGenerator (play){
    play.pieceType = getRandomPieceType();
    play.piece = getTetromino(play.pieceType);
    play.position = {x: 4, y: 0};

}

function holdPiece(matrix){
    if(heldPiece==null) {
        heldPiece = matrix
        drawHeldPiece(heldPiece)

        spawnNewPiece(queue.shift())

    }
    else{
        queue[0].piece=player.piece
        temp=player.piece
        player.piece=heldPiece
        heldPiece=temp
        clearCanvas(context2)
        drawHeldPiece(matrix)

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

function spawnNewPiece(piece){
console.log(piece)
    player.piece = piece.piece
    player.position=piece.position
    player.pieceType=piece.pieceType

 randomPieceGenerator(tempPiece)
    queue.push({piece:tempPiece.piece,position:{x:tempPiece.position.x,y:tempPiece.position.y}})
    holdBoolean=0

    clearCanvas(context3)
    drawPreviewPiece()
    if (chechTopLine()){
        player.gamePhase=1
    }

}

const tetrominoTypes = ["T", "L", "J", "S", "Z", "O", "I"];
function getRandomPieceType() {
    const index = Math.floor(Math.random() * tetrominoTypes.length);
    return tetrominoTypes[index];
}

function drawGameBoard() {
    
    context.shadowColor = 'transparent';
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.clientWidth, canvas.height);
    // Draw the grid lines (optional)
    context.strokeStyle = "#f0f1f5"; // New grid line color
    context.lineWidth = 0.05;
    for (let i = 0; i <= gameBoard.width; i++) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, gameBoard.height);
        context.stroke();
    }
    for (let i = 0; i <= gameBoard.height; i++) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(gameBoard.width, i);
        context.stroke();
    }

    // // Draw the static pieces

    gameBoard.grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                drawBlock(x,y,value,{x:0,y:0},context);
               
            }
        });
    });

    // Draw the moving piece
    if (player.piece) {
        dropShadow();
        drawTetromino(player.piece, player.position,context);

    }
}
function clearCanvas(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
function drawHeldPiece(matrix){

    drawTetromino(matrix,{x: 2, y: 2},context2)
}

function drawPreviewPiece(){

    for(let i =0;i<queue.length;i++){
    drawTetromino(queue[i].piece,{x: 2, y: 2+(5*i)},context3)}
}

initializeGameBoard();

if(player.gamePhase===0)
update();
else
    console.log("Game Over");


