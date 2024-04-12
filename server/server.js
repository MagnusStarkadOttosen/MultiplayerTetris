//This is where the server is

const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const path = require('path');

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

const gameController = new GameController(io);

io.on("connection", (socket) => {
    console.log("A user connected");
    GameController.addPlayer(socket.id);

    socket.on("send-message", (message) => {
        io.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
    });

    socket.on("playerMove", (direction) => {
        gameController.handlePlayerMove(socket.id, direction);
    });

    socket.on("playerRotate", (rotationDirection) => {
        gameController.handlePlayerRotation(socket.id, rotationDirection);
    });

    socket.on("playerFall", () => {

    });

    socket.on("playerHold", () => {

    });

    socket.on("playerDrop", () => {

    });

});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
