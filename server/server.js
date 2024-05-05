//This is where the server is
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { GameController } from './controllers/gameController.js';
import { fileURLToPath } from 'url';

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

const gameController = new GameController(io);
const gameController2 = new GameController(io);
let swit = 0;
let room1=[]
let room2=[]
let room3=[]
let room4=[]


io.on("connection", (socket) => {
    // console.log("A user connected");
    console.log(socket.connected)
    // if(swit==0) {
    //     gameController.addPlayer(socket.id);
    //     gameController.addGameboard(socket.id);
    //     console.log(socket.id)
    //     list1.push(socket.id)
    //     swit=1
    // }else
    // {
    //     gameController2.addPlayer(socket.id);
    //     gameController2.addGameboard(socket.id);
    //     list2.push(socket.id)
    //     swit=0

    // }
    
    socket.on("send-message", (message) => {
        console.log("init-game" + message);
        io.emit("init-game", message);
        let myArray = message.split("|");
        let name = myArray[0];
        let room = myArray[1];
        gameController.addPlayer(socket.id, name);
        gameController.addGameboard(socket.id);
        console.log(socket.id)
        if(roomId=="room1")
        room1.push(socket.id)
        if(roomId=="room2")
        room2.push(socket.id)
        if(roomId=="room3")
        room3.push(socket.id)
        if(roomId=="room4")
        room4.push(socket.id)

    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
    });

    socket.on("playerMove", (direction) => {
       if( list1.includes(socket.id,0)){
           console.log(socket.id)
           gameController.handlePlayerMove(socket.id, direction);}
       else{
           gameController2.handlePlayerMove(socket.id, direction);}


    });

    socket.on("playerRotate", (rotationDirection) => {
        if( list1.includes(socket.id,0)){
            console.log(socket.id)
            gameController.handlePlayerRotation(socket.id, rotationDirection);}
        else{
            gameController2.handlePlayerRotation(socket.id, rotationDirection);}

    });

    socket.on("playerFall", () => {
        if( list1.includes(socket.id,0)){
            console.log(socket.id)
            gameController.handlePlayerFall(socket.id)}
        else{
            gameController2.handlePlayerFall(socket.id)}


    });

    socket.on("playerHold", () => {

    });

    socket.on("playerDrop", () => {
        if(list1.includes(socket.id,0)){
            console.log(socket.id)
            gameController.handleDrop(socket.id)}
        else{
            gameController2.handleDrop(socket.id)
        }


    });

    socket.on("test", () => {
        console.log('testing');
        io.emit("receive-message", "testing ack");
    });

});

const PORT = 25565;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
