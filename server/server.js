//This is where the server is
import http from 'http';
import express from 'express';
import {Server} from 'socket.io';
import path from 'path';
import {RoomManager} from './controllers/roomManager.js';
import {fileURLToPath} from 'url';
// const path = require('path');

const app = express();

let roomNumber;

const server = http.createServer(app);
// const io = new SocketIO(server);
const io = new Server(server, {
    cors: {
        origin: "http://dtu62597.eduhost.dk:10311",  // Allows all domains, adjust as needed for security
        // origin: "http://localost:3000",
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
for (let i = 1; i <= 4; i++) {
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
    socket.on('ready', (roomId) => {
        roomManager.getGameController(socket.id).playerReady(socket.id);
    });
    socket.on("game-board", (gameBoard) => {
        let controller = roomManager.getGameController(socket.id);
        if (controller != null) {
            controller.updateGameBoards(gameBoard, socket.id);
        }
    });
    socket.on("game-over", (player) => {
        let controller = roomManager.getGameController(socket.id);
        if (controller != null) {
            controller.updateGameOver(socket.id, player);
        }
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
