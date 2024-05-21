import { getTetromino } from './tetronimoes.js';
export class GameController {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.width = 10
        this.roomName = roomName;
        this.room=0
        this.height = 22
        this.gameBoards = { //Creates a 2D array with the given size

            };
        this.greyLineQueue= {}
        this.initGameLoop();
    }
    updateGameBoards(gameBoard, socketId) {
        this.gameBoards[socketId] = gameBoard;
    }

    updateGameOver(socketId) {
        this.players[socketId].gameOver = true;
        let k = null;
        let keys = Object.keys(this.players);
        let isSent = false;
        for (let i = 0; i < keys.length; i++) {
            if (this.players[keys[i]].gameOver == false) {
                if (k == null) {
                    k = keys[i];
                    isSent = true
                } else {
                    isSent = false
                }
            }
        }
        if (isSent)
            this.io.emit("victory", k);
    }

    getState() {
        let isFull = Object.keys(this.players).length >= 5;
        return {roomId: this.roomName, isFull: isFull, players: Object.keys(this.players).length}
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
            nextPiecesReal: this.createPieceList(pieceList),
            start: false,
            points: 0,
            level: 0,
            speed: 48,
            gameOver: false,
            socketId: socketId,
            holdCooldown: false,
            ready: false,
            name: name
        }

    }

    playerReady(socketId) {
        this.players[socketId].ready = true;
    }
    createPieceList(pieceList){
        let newPieceList=[]
        for(let i =0;i<pieceList.length;i++){
            console.log(pieceList[i])
            newPieceList.push(getTetromino(pieceList[i].type)[pieceList[i].rotation])
        }
        return newPieceList;
    }

    addGameboard(socketId){
        console.log("addGameboard")
        this.gameBoards[socketId] = {
            width: this.width,
            height: this.height,
            grid: this.initializeGameBoard(),
        }
        this.greyLineQueue[socketId] =0
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

     checkGameover(socketId){
        for (let x = 0; x < this.gameBoards[socketId].grid[3].length; x++) {

            if (this.gameBoards[socketId].grid[3][x] !== 0 && this.gameBoards[socketId].grid[3][x] !== 8) {
                this.players[socketId].gameOver = true
                return
            }
        }
    }


     removeDropShadow(socketId){

         for (let y = 0; y < this.gameBoards[socketId].grid.length; y++) {
             for (let x = 0; x < this.gameBoards[socketId].grid[y].length; x++) {
                 if (this.gameBoards[socketId].grid[y][x] === 8) {
                     this.gameBoards[socketId].grid[y][x] = 0
                 }

             }
        }
    }

    updatePieceQueue(socketId) {
        let player = this.players[socketId];
        if (player.nextPieces.length <= 3) {//generates new list if the player only have 3 pieces left
            //Generate new piece list and append it to the last
            console.log("piece queue");
            let newPieces = this.generatePieceList();
            player.nextPieces.push(...newPieces);
        }
        player.nextPiecesReal = this.createPieceList(player.nextPieces)

    }

    shiftToNextPiece(socketId) {
        let player = this.players[socketId];

        player.currentPiece = player.nextPieces.shift();
        this.updatePieceQueue(socketId);
        player.holdCooldown = false
        // this.broadcastState();
    }

    removePlayer(socketId) {
        let boards = Object.values(this.gameBoards)

        delete this.gameBoards[socketId]
        delete this.players[socketId]
        console.log(this.gameBoards)

        console.log(boards)
    }
    isPlayer(socketId) {
        if (this.players.hasOwnProperty(socketId))
            return true;
        else
            return false;
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
                this.applyGreyLines(socketId)

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
        this.addGreyLines(linesCleared,socketId)
        // Increase score based on linesCleared, adjust game speed, etc.
    }

    addGreyLines(linesCleared,socketId){

        if (linesCleared>1&& Object.values(this.players).length>1) {
            let players = Object.values(this.players)
            let availablePlayers = []
            console.log(socketId)
            for (let i = 0; i < players.length; i++) {
                console.log(players[i].socketId)
                console.log(players[i].gameOver)
                console.log(players[i].socketId==socketId)
                if (!(players[i].socketId===socketId) && (players[i].gameOver === false)) {
                    console.log("test")

                    availablePlayers.push(players[i])
                }
            }
            if (availablePlayers.length > 0) {
            let random =Math.floor(Math.random()*availablePlayers.length)
                this.greyLineQueue[availablePlayers[random].socketId]+=linesCleared-1

        }
        }

    }

    applyGreyLines(socketId){
        while(this.greyLineQueue[socketId]>0){
            console.log("greylinequeue")
            for (let i = 0; i < this.height-1; i++) {

                this.gameBoards[socketId].grid[i] = this.gameBoards[socketId].grid[i + 1].slice()

            }
            let random =Math.floor(Math.random()*9)
            console.log(random)
            for (let i = 0; i < 10; i++) {
                this.gameBoards[socketId].grid[this.height-1][i] =0
                if( random !== i){
                    this.gameBoards[socketId].grid[this.height-1][i] = 9
                }

            }

             this.greyLineQueue[socketId]--
         }
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
        this.checkGameover(socketId)

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

    //function to handle pieces will hurry down to the bottom
    // handleDrop will call handlePlayerFall until the piece has collided with another piece
    handleDrop(socketId){
        while(this.handlePlayerFall(socketId)){}
        // const player = this.players[socketId];
        // let newPiece = player.currentPiece

        // while (!this.pieceCollided(newPiece)) {
        //     newPiece.position.y += 1;
        // }
        // newPiece.position.y -= 1;
        // this.updatePiece(player.currentPiece, newPiece);
        // this.placePiece(player.currentPiece);
        // this.checkForLineClears();
        // this.shiftToNextPiece();
        // this.broadcastState();
    }
     
    handleHold(socketId) {


        const player = this.players[socketId];
        if (!player.holdCooldown) {

        let currentPiece = this.copyPiece(player.currentPiece)
        let holdPiece = player.holdPiece


        if (holdPiece === null) {
            player.holdPiece = this.copyPiece(player.currentPiece);
            this.clearPiece(currentPiece, socketId)
            this.shiftToNextPiece(socketId);
        } else {
            console.log(holdPiece)
            this.clearPiece(currentPiece, socketId)
            player.currentPiece = this.copyPiece(player.holdPiece)
            player.currentPiece.position = {x: 5, y: 0}
            console.log(currentPiece.type)
            player.holdPiece = this.copyPiece(currentPiece)
            player.holdPiece.rotation = 0
        }
        this.broadcastState(socketId);
        player.holdCooldown = true
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
        let isready = false;
        for (const playerId in this.players) {
            if (this.players.hasOwnProperty(playerId)) {
                    const player = this.players[playerId];
                    isready = player.ready;
                    if(!player.gameOver) {

                    // Handle player's piece falling
                    // this.handlePlayerFall(playerId);

                    // // Check for line clears
                    this.checkForLineClears(playerId);
                    // Shift to next piece if necessary
                    // if (this.pieceCollided(player.currentPiece)) {
                    //     this.shiftToNextPiece(playerId);
                    // }
                }
                this.broadcastState(playerId)

            }

        }
        if (isready){
            this.io.emit('playing' + this.roomName, "ready");
        }
        }

        //this.broadcastState();

}
