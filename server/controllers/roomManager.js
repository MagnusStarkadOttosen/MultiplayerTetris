import { GameController } from './gameController.js';
export class Room {
    constructor(id, io) {
        this.id = id;
        this.gameController = new GameController(io, id);
        console.log(this.gameController);
    }

    addPlayer(playerId, name) {
        this.gameController.addPlayer(playerId, name);
        this.gameController.addGameboard(playerId);
    }

    removePlayer(playerId) {
        this.gameController.removePlayer(playerId);
    }

    getOpponents(playerId) {

    }

    getState() {
        try {
            return this.gameController.getState();
        } catch (error) {
            console.error('Failed to get state from GameController:', error);
        }
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
export class RoomManager {
    constructor(io) {
        this.rooms = {};
        this.io = io;
        this.init();
    }

    createRoom(roomId) {
        this.rooms[roomId] = new Room(roomId, this.io);
    }

    deleteRoom(roomId) {
        if(this.rooms[roomId]){
             delete this.rooms[roomId];
        }
    }
    init() {
        setInterval(() => {
            let arr = [];
            for (const key in this.rooms) {
                arr.push(this.rooms[key].getState())
            }
            this.io.emit("room-state", arr);
        }, 1000);
    }

    addPlayerToRoom(roomId, playerId, name) {
        if (!this.rooms[roomId]) {
            this.createRoom(roomId);
        }
        this.rooms[roomId].addPlayer(playerId, name);
    }

    removePlayerFromRoom(roomId, playerId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].removePlayer(playerId);
            // if (this.rooms[roomId].players.length===0){
            //     this.deleteRoom(roomId);
            // }
        }
    }

    removePlayer(playerId) {
        for (const key in this.rooms) {
            this.rooms[key].removePlayer(playerId)
        }
    }
    getRoom(roomId) {
        return this.rooms[roomId];
    }

    getGameController(playerId) {
        for (const key in this.rooms) {
            if (this.rooms[key].gameController.isPlayer(playerId)) {
                // console.log( this.rooms[key].gameController);
                return this.rooms[key].gameController;
            }
        }
    }
    executePlayerAction(roomId, playerId, action, payload) {
        const room = this.rooms[roomId];
        if (room) {
            room.handlePlayerAction(playerId, action, payload);
        }
    }
}

