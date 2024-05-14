//This is where the server is
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './controllers/roomManager.js';

// const http = require("http");
// const expraess = require("express");
// const socketIo = require("socket.io");
// const path = require('path');

const app = express();

const server = http.createServer(app);
// const io = new SocketIO(server);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:63342",  // Allows all domains, adjust as needed for security
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

const roomManager = new RoomManager(io);
for (let i = 1; i <= 4 ; i++) {
    roomManager.createRoom("room" + i);
}

io.on("connection", (socket) => {
    // console.log("A user connected");
    console.log(socket.connected)
    
    socket.on("send-message", (message) => {
    });
    socket.on("init-game", (message) => {
        console.log("init-game" + message);
        io.emit("init-game", message);
        let myArray = message.split("|");
        let name = myArray[0];
        let roomId = myArray[1]; 
        roomManager.getRoom(roomId).addPlayer(socket.id, name);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
        roomManager.removePlayer(socket.id);
    });

    socket.on("playerMove", (direction) => {
        console.log(direction)
        roomManager.getGameController(socket.id).handlePlayerMove(socket.id, direction);

    });

    socket.on("playerRotate", (rotationDirection) => {
        roomManager.getGameController(socket.id).handlePlayerRotation(socket.id, rotationDirection);

    });

    socket.on("playerFall", () => {
        roomManager.getGameController(socket.id).handlePlayerFall(socket.id);
    });

    socket.on("playerHold", () => {
        roomManager.getGameController(socket.id).handleHold(socket.id);
    });

    socket.on("playerDrop", () => {
        roomManager.getGameController(socket.id).handleDrop(socket.id);
    });

    socket.on("test", () => {
        console.log('testing');
        io.emit("receive-message", "testing ack");
    });
    socket.on('ready',(roomId) => {
        roomManager.getGameController(socket.id).playerReady(socket.id);
    });
    socket.on("game-board",(gameBoard) => {
        let controller = roomManager.getGameController(socket.id);
        if(controller!=null) {
            controller.updateGameBoard(socket.id, gameBoard);
        }
    });
    socket.on("game-over", (player) => {
        let controller = roomManager.getGameController(socket.id);
        if(controller!=null) {
            controller.handleGameOver(socket.id, player);
        }
    });
});

const PORT = 25565;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
