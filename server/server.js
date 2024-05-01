//This is where the server is
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { GameController } from './controllers/gameController.js';
import { fileURLToPath } from 'url';

// const http = require("http");
// const express = require("express");
// const socketIo = require("socket.io");
// const path = require('path');

const app = express();

const server = http.createServer(app);
// const io = new SocketIO(server);
const io = new Server(server, {
    cors: {
        origin: "http://dtu62597.eduhost.dk:10311",  // Allows all domains, adjust as needed for security
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

const gameController = new GameController(io);

io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.connected)
    gameController.addPlayer(socket.id);
    
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
        gameController.handlePlayerFall(socket.id)

    });

    socket.on("playerHold", () => {

    });

    socket.on("playerDrop", () => {

    });

    socket.on("test", () => {
        console.log('testing');
        io.emit("receive-message", "testing ack");
    });

});

const PORT = 25565;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
