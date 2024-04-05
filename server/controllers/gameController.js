class GameController {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.gameBoard = { //Creates a 2D array with the given size
            width: 10,
            height: 20,
            grid: this.initializeGameBoard(),
        };
    }

    initializeGameBoard() { //Makes a 2D array filled with zero
        let grid = [];
        for (let y = 0; y < this.gameBoard.height; y++) {
            grid[y] = new Array(this.gameBoard.width).fill(0);
        }
        return grid;
    }

    addPlayer(socketId) {

        //TODO: add generate a list of pieces
        //generatePieceList();

        this.players[socketId] = {
            position: {x:0, y:0},
            rotation: 0,
            currentPiece: "T", //need to be generated
            holdPiece: null,
            nextPieces: ["L", "J", "O"], //need to be a list generated
            points: 0,
            level: 0,
            speed: 48,
        }
        this.broadcastState();
    }

    removePlayer(socketId) {
        //Clean up player state
    }

    handlePlayerMove(socketId, direction) {
        const player = this.players[socketId];
        let newPosition = { ...player.position };

        switch(direction) {
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
        }

        if (!this.pieceCollided(player.currentPiece, newPosition)) {
            this.updatePlayerPiece(player.currentPiece, player.position, newPosition);
            player.position = newPosition;
            this.broadcastState();
        }
    }

    handlePlayerFall(socketId){
        const player = this.players[socketId];
        let newPosition = { ...player.position };
        
        newPosition.y += 1;

        if (!this.pieceCollided(player.currentPiece, newPosition)) {
            this.updatePlayerPiece(player.currentPiece, player.position, newPosition);
            player.position = newPosition;
            this.broadcastState();
        } else{
            this.placePiece(player.position, player.currentPiece);
            this.checkForLineClears();

            this.broadcastState();
        }
    }

    updatePiecePosition(piece, oldPosition, newPosition) {
        //Clear the piece's old position
        this.clearPiece(oldPosition, piece);
        //Place the piece on the board
        this.placePiece(newPosition, piece);
    }

    clearPiece(position, piece){
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    this.gameBoard[position.y + y][position.x + x] = 0;
                }
            }
        }
    }

    placePiece(position, piece){
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    this.gameBoard[position.y + y][position.x + x] = piece[y][x];
                }
            }
        }
    }

    broadcastState() {
        //Broadcast the updated game state to all connected clients
        this.io.emit('game-state', {
            this.players,
            gameBoard: this.gameBoard.grid,
        });
    }

    pieceCollided(piece, position) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0) {
                    let boardX = position.x + x;
                    let boardY = position.y + y;
                    // Check if the piece is outside the game board horizontally or has reached the bottom
                    if (boardX < 0 || boardX >= this.gameBoard.width || boardY >= this.gameBoard.height) {
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
}
