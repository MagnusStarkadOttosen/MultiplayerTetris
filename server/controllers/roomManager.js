class Room {
    constructor(id,io) {
        this.id = id;
        this.players = [];
        this.gameController = new GameController(io);
    }

    addPlayer(playerId) {
        this.players.push(playerId);
        this.gameController.addPlayer(playerId);
    }

    removePlayer(playerId) {
        this.players = this.players.filter(id => id !== playerId);
        this.gameController.removePlayer(playerId);
    }

    getOpponents(playerId) {
        return this.players.filter(id => id !== playerId);

    }
    handlePlayerAction(playerId, action, payload) {
        //Handle player actions
        switch(action) {
            case 'move':
                this.gameController.handlePlayerMove(playerId, payload.direction);
                break;
            case 'fall':
                this.gameController.handlePlayerFall(playerId);
                break;
            case 'rotate':
                this.gameController.handlePlayerRotation(playerId, payload.direction);
                break;
            case 'drop':
                this.gameController.handleDrop(playerId);
                break;
            case 'hold':
                this.gameController.handleHold(playerId);
                break;
        }
    }
}
class RoomManager {
    constructor(io) {
        this.rooms = {};
        this.io = io;
    }

    createRoom(roomId) {
        this.rooms[roomId] = new Room(roomId), this.io;
    }

    deleteRoom(roomId) {
        if(this.rooms[roomId]){
             delete this.rooms[roomId];
        }
    }

    addPlayerToRoom(roomId, playerId) {
        if (!this.rooms[roomId]) {
            this.createRoom(roomId);
        }
        this.rooms[roomId].addPlayer(playerId);
    }

    removePlayerFromRoom(roomId, playerId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].removePlayer(playerId);
            if (this.rooms[roomId].players.lenght===0){
                this.deleteRoom(roomId);
            }
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }
    executePlayerAction(roomId, playerId, action, payload) {
        const room = this.rooms[roomId];
        if (room) {
            room.handlePlayerAction(playerId, action, payload);
        }
    }
}

