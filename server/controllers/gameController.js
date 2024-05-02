import { getTetromino } from './tetronimoes.js';
export class GameController {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.width = 10
        this.height = 22
            this.gameBoards = { //Creates a 2D array with the given size

            };
        this.initGameLoop();
    }

    initializeGameBoard() { //Makes a 2D array filled with zero
        let grid = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = new Array(this.width).fill(0);
        }
        return grid;
    }

    addPlayer(socketId) {
        let pieceList = this.generatePieceList();
        console.log("addPlayer")
        this.players[socketId] = {
            currentPiece: pieceList.shift(), //Takes the first element in the list
            holdPiece: null,
            nextPieces: pieceList, //The rest of the pieces
            points: 0,
            level: 0,
            speed: 48,
        }

    }

    addGameboard(socketId){
        console.log("addGameboard")
        this.gameBoards[socketId] = {
            width: this.width,
            height: this.height,
            grid: this.initializeGameBoard(),
        }
        console.log(this.gameBoards)

    }

    generatePieceList() {
        const pieces = ['I', 'T', 'O', 'L', 'J', 'S', 'Z'];

        //Create list with one of each type
        let list = pieces.map(type => {
            return {
                type: type,
                rotation: 0,
                position: {x: 5, y: 0}
            };
        });

        //Shuffle the list
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }

        return list;
    }

    createDropShadow(piece,socketId) {
        let dropShadow = this.copyPiece(piece)
        for (let y = 0; y < dropShadow.length; y++) {
            for (let x = 0; x < dropShadow[y].length; x++) {
                if (dropShadow[y][x] !== 0) {
                    dropShadow[y][x] = 8

                }}}

        while (!this.pieceCollided(dropShadow,undefined,socketId)) {

        dropShadow.position.y++




    }
        dropShadow.position.y-=1
        this.placePiece(dropShadow,socketId)

     }
     removeDropShadow(socketId){

         for (let y = 0; y < this.gameBoards[socketId].grid.length; y++) {
             for (let x = 0; x < this.gameBoards[socketId].grid[y].length; x++) {
                 if (this.gameBoards[socketId].grid[y][x] === 8) {
                     this.gameBoards[socketId].grid[y][x] = 0
                 }

             }
         }}

    updatePieceQueue(socketId) {
        let player = this.players[socketId];
        if (player.nextPieces.length <= 3) {//generates new list if the player only have 3 pieces left
            //Generate new piece list and append it to the last
            console.log("piece queue");
            let newPieces = this.generatePieceList();
            player.nextPieces.push(...newPieces);
        }
    }

    shiftToNextPiece(socketId) {
        let player = this.players[socketId];

        player.currentPiece = player.nextPieces.shift();
        this.updatePieceQueue(socketId);
        // this.broadcastState();
    }

    removePlayer(socketId) {
        //Clean up player state
    }

    copyPiece(piece){
        let newPiece = getTetromino(piece.type)[piece.rotation]
        newPiece.position = {x:piece.position.x,y:piece.position.y}
        newPiece.rotation = piece.rotation
        newPiece.type = piece.type
        return newPiece
    }
    handlePlayerMove(socketId, direction) {
        const player = this.players[socketId];
        if (!player || !player.currentPiece) return;
        let newPiece = this.copyPiece(player.currentPiece)

        switch (direction) {
            case 'left':
                newPiece.position.x -= 1;
                break;
            case 'right':
                newPiece.position.x += 1;
                break;
        }

        if (!this.pieceCollided(newPiece,player.currentPiece,socketId)) {
            this.updatePiece(player.currentPiece, newPiece,socketId);
            player.currentPiece = this.copyPiece(newPiece)


            // this.broadcastState();
        }
    }

    handlePlayerFall(socketId) {

        const player = this.players[socketId];
        if (player.currentPiece!== undefined) {
    //console.log("test: " +player.rotation)
            let newPiece = this.copyPiece(player.currentPiece)
//console.log("new piece: "+newPiece.position.x+" "+newPiece.position.y+" "+newPiece.rotation)
        newPiece.position.y += 1;

            if (!this.pieceCollided(newPiece,player.currentPiece,socketId)) {
            //console.log("not collided")
            this.updatePiece(player.currentPiece, newPiece,socketId);
            player.currentPiece = newPiece;
            // this.broadcastState();
        } else {

            //console.log("test before place")
            this.placePiece(player.currentPiece,socketId);
            this.checkForLineClears(socketId);
            this.shiftToNextPiece(socketId);
            // this.broadcastState();
                return false
        }
    }
        return true
}
    handleDrop(socketId){
        while(this.handlePlayerFall(socketId)){}

}

    broadcastState(socketId) {
        //Broadcast the updated game state to all connected clients
        this.io.to(socketId).emit('game-state', {
            players: this.players,
            gameBoards: this.gameBoards,
        });
    }

    pieceCollided(piece,oldpiece,socketId) {

        //console.log("before if piece")
        if (!piece) return true;
        //console.log("before for")

        //console.log("piece type: ", piece.type)

        const tetromino = getTetromino(piece.type)[piece.rotation];

        //console.log("tetromino lenght: ", tetromino.length)
        //console.log("tetromino heigth: ", tetromino[0].length)

        for (let y = 0; y < tetromino.length; y++) {
            for (let x = 0; x < tetromino[y].length; x++) {
               // console.log("before if")
                if (tetromino[y][x] !== 0) {
                    //   console.log("after if")
                    let boardX = piece.position.x + x;
                    let boardY = piece.position.y + y;
                    //   console.log("Checking position x: ", boardX);
                    // console.log("Checking position y: ", boardY);
                    // Check if the piece is outside the game board horizontally or has reached the bottom
                    if (boardX < 0 || boardX >= this.gameBoards[socketId].width || boardY >= this.height) {

                        return true;
                    }
                    // Prevent accessing gameBoard.grid[boardY] if boardY is out of bounds
                    // This also implicitly checks if boardY is below the bottom of the game board
                }}}
        if(oldpiece!== undefined)
        this.clearPiece(oldpiece,socketId);
        this.removeDropShadow(socketId)

        for (let y = 0; y < tetromino.length; y++) {
            for (let x = 0; x < tetromino[y].length; x++) {
                // console.log("before if")
                if (tetromino[y][x] !== 0) {
                    //   console.log("after if")
                    let boardX = piece.position.x + x;
                    let boardY = piece.position.y + y;


// console.log(this.gameBoard.grid[boardY][boardX])
                    //console.log(this.gameBoard.grid)

                    if (boardY < 0 || !this.gameBoards[socketId].grid[boardY] || this.gameBoards[socketId].grid[boardY][boardX] !== 0) {

                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkForLineClears(socketId) {
        let linesCleared = 0;
        for (let y = 0; y < this.gameBoards[socketId].height; y++) {
            if (this.gameBoards[socketId].grid[y].every(value => value !== 0&&value !==8)) {
                //Remove the full line
                this.gameBoards[socketId].grid.splice(y, 1);
                //Add an empty line at the top
                this.gameBoards[socketId].grid.unshift(new Array(this.gameBoards[socketId].width).fill(0));
                linesCleared++;
                y--; //Check the new line at the same position
            }
        }


        // Increase score based on linesCleared, adjust game speed, etc.
    }

    handlePlayerRotation(socketId, direction) {
        let player = this.players[socketId];
        let newPiece = this.copyPiece(player.currentPiece)

        if (direction == "clockwise") {
            newPiece.rotation = (newPiece.rotation + 1) % 4;
        } else {
            newPiece.rotation = (newPiece.rotation - 1 + 4) % 4;
        }
        newPiece = this.copyPiece(newPiece)

        if (!this.pieceCollided(newPiece,player.currentPiece,socketId)) {
            this.updatePiece(player.currentPiece, newPiece,socketId);
            player.currentPiece = newPiece;
            // this.broadcastState();
        }
    }

    updatePiece(oldPiece, newPiece,socketId) {
        //Clear the piece's old position
        this.removeDropShadow(socketId)
        this.clearPiece(oldPiece,socketId);
        //Place the piece on the board
        this.createDropShadow(newPiece,socketId)

        this.placePiece(newPiece,socketId);

        this.broadcastState(socketId);

    }

    clearPiece(piece,socketId) {
        const tetromino = getTetromino(piece.type)[piece.rotation];
        for (let y = 0; y < tetromino.length; y++) {
            for (let x = 0; x < tetromino[y].length; x++) {
                if (tetromino[y][x] !== 0) {
                   // console.log("ppos y: ", piece.position.y);
                   // console.log("pos y: ", y);
                    //console.log("ppos x: ", piece.position.x);
                    //console.log("pos x: ", x);

                    this.gameBoards[socketId].grid[piece.position.y + y][piece.position.x + x] = 0;
                }
            }
        }
    }

    placePiece(piece,socketId) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    this.gameBoards[socketId].grid[piece.position.y + y][piece.position.x + x] = piece[y][x];
                }
            }
        }
    }

    //Updates the game every 1 second
    initGameLoop(socketId) {
        setInterval(() => {
            this.updateGame();
        }, 1000);
    }

    updateGame() {
        // if (this.players && Object.keys(this.players).length > 0) {
        //     Object.values(this.players).forEach(player => {
        //         if (player && player.currentPiece) {
        //             this.handlePlayerFall(player.socketID);
        //         }
        //     });
        // }

        for (const playerId in this.players) {
            if (this.players.hasOwnProperty(playerId)) {
                const player = this.players[playerId];

                // Handle player's piece falling
                this.handlePlayerFall(playerId);

                // // Check for line clears
                this.checkForLineClears(playerId);

                // Shift to next piece if necessary
                // if (this.pieceCollided(player.currentPiece)) {
                //     this.shiftToNextPiece(playerId);
                // }
            }
        }

        //this.broadcastState();
    }
}
