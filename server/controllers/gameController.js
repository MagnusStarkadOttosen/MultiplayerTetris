import { getTetromino } from './tetronimoes.js';
export class GameController {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.width = 10,
        this.height = 20,
        this.gameBoard = { //Creates a 2D array with the given size
            width: this.width,
            height: this.height,
            grid: this.initializeGameBoard(),
        };
        this.initGameLoop();
    }

    initializeGameBoard() { //Makes a 2D array filled with zero
        let grid = [];
        for (let y = 0; y < 20; y++) {
            grid[y] = new Array(10).fill(0);
        }
        return grid;
    }

    addPlayer(socketId) {
        let pieceList = this.generatePieceList();
        console.log("addPlayer 123")
        this.players[socketId] = {
            currentPiece: pieceList.shift(), //Takes the first element in the list
            holdPiece: null,
            nextPieces: pieceList, //The rest of the pieces
            points: 0,
            level: 0,
            speed: 48,
        }
        this.broadcastState();
    }

    generatePieceList() {
        const pieces = ['I', 'T', 'O', 'L', 'J', 'S', 'Z'];

        //Create list with one of each type
        let list = pieces.map(type => {
            return {
                type: type,
                rotation: 0,
                position: { x: 5, y: 0 }
            };
        });

        //Shuffle the list
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }

        return list;
    }

    updatePieceQueue(socketId) {
        let player = this.players[socketId];
        if (player.nextPieces.length <= 3) {//generates new list if the player only have 3 pieces left
            //Generate new piece list and append it to the last
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

    handlePlayerMove(socketId, direction) {
        const player = this.players[socketId];
        if (!player || !player.currentPiece) return;
        let newPiece = { ...player.currentPiece }

        switch (direction) {
            case 'left':
                newPiece.position.x -= 1;
                break;
            case 'right':
                newPiece.position.x += 1;
                break;
        }

        if (!this.pieceCollided(newPiece)) {
            this.updatePiece(player.currentPiece, newPiece);
            player.currentPiece = newPiece;
            // this.broadcastState();
        }
    }

    handlePlayerFall(socketId) {
        const player = this.players[socketId];
        let newPiece = { ...player.currentPiece }

        newPiece.position.y += 1;

        if (!this.pieceCollided(newPiece)) {
            this.updatePiece(player.currentPiece, newPiece);
            player.currentPiece = newPiece;
            // this.broadcastState();
        } else {
            console.log("test before place")
            this.placePiece(player.currentPiece);
            this.checkForLineClears();
            this.shiftToNextPiece();
            // this.broadcastState();
        }
    }

    broadcastState() {
        //Broadcast the updated game state to all connected clients
        this.io.emit('game-state', {
            players: this.players,
            gameBoard: this.gameBoard.grid,
        });
    }

    pieceCollided(piece) {
        if (!piece) return true;

        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    let boardX = piece.position.x + x;
                    let boardY = piece.position.y + y;
                    // Check if the piece is outside the game board horizontally or has reached the bottom
                    if (boardX > 0 || boardX <= this.gameBoard.width || boardY > this.gameBoard.height-1) {
                        return true;
                    }
                    // Prevent accessing gameBoard.grid[boardY] if boardY is out of bounds
                    // This also implicitly checks if boardY is below the bottom of the game board
                    if (boardY < 0 || !this.gameBoard.grid[boardY] || this.gameBoard.grid[boardY][boardX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkForLineClears() {
        let linesCleared = 0;
        for (let y = 0; y < this.gameBoard.height; y++) {
            if (this.gameBoard.grid[y].every(value => value !== 0)) {
                //Remove the full line
                this.gameBoard.grid.splice(y, 1);
                //Add an empty line at the top
                this.gameBoard.grid.unshift(new Array(this.gameBoard.width).fill(0));
                linesCleared++;
                y--; //Check the new line at the same position
            }
        }


        // Increase score based on linesCleared, adjust game speed, etc.
    }

    handlePlayerRotation(socketId, direction) {
        let player = this.players[socketId];
        let newPiece = player.currentPiece

        if (direction == "clockwise") {
            newPiece.rotation = (newPiece.rotation + 1) % 4;
        } else {
            newPiece.rotation = (newPiece.rotation - 1 + 4) % 4;
        }

        if (!this.pieceCollided(newPiece)) {
            this.updatePiece(player.currentPiece, newPiece);
            player.currentPiece = newPiece;
            // this.broadcastState();
        }
    }

    updatePiece(oldPiece, newPiece) {
        //Clear the piece's old position
        this.clearPiece(oldPiece);
        //Place the piece on the board
        this.placePiece(newPiece);
    }

    clearPiece(piece) {
        const tetromino = getTetromino(piece.type)[piece.rotation];
        for (let y = 0; y < tetromino.length; y++) {
            for (let x = 0; x < tetromino[y].length; x++) {
                if (tetromino[y][x] !== 0) {
                    console.log("ppos y: ", piece.position.y);
                    console.log("pos y: ", y);
                    console.log("ppos x: ", piece.position.x);
                    console.log("pos x: ", x);
                    this.gameBoard.grid[piece.position.y + y][piece.position.x + x] = 0;
                }
            }
        }
    }

    placePiece(piece) {
        const tetromino = getTetromino(piece.type)[piece.rotation];
        for (let y = 0; y < tetromino.length; y++) {
            for (let x = 0; x < tetromino[y].length; x++) {
                if (tetromino[y][x] !== 0) {
                    this.gameBoard.grid[piece.position.y + y][piece.position.x + x] = tetromino[y][x];
                }
            }
        }
    }

    //Updates the game every 1 second
    initGameLoop() {
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

                // Check for line clears
                this.checkForLineClears();

                // Shift to next piece if necessary
                if (this.pieceCollided(player.currentPiece)) {
                    this.shiftToNextPiece(playerId);
                }
            }
        }

        this.broadcastState();
    }
}
