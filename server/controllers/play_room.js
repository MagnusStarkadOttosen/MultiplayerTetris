class Room {
    constructor(id) {
        this.id = id;
        this.players = [];
    }

    addPlayer(playerId) {
        this.players.push(playerId);
    }

    removePlayer(playerId) {
        this.players = this.players.filter(id => id !== playerId);
    }

    getOpponents(playerId) {
        return this.players.filter(id => id !== playerId);
    }
}
class RoomManager {
    constructor() {
        this.rooms = {};
    }

    createRoom(roomId) {
        this.rooms[roomId] = new Room(roomId);
    }

    deleteRoom(roomId) {
        delete this.rooms[roomId];
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
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }
}

