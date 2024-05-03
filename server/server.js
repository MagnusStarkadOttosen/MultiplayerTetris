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
let roomNumber;

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
const gameController3 = new GameController(io);
const gameController4 = new GameController(io);

const controllers =[gameController,gameController2,gameController3,gameController4]

let list1=[]
let list2=[]
let list3=[]
let list4=[]

let lists= [list1,list2,list3,list4]

function findRoom(id){
    if( list1.includes(id,0)){
        return 0;}
    else if( list2.includes(id,0)){
        return 1;
    }
    else  if( list3.includes(id,0)){
        return 2
    }
    else{
          return 3
    }
    }



io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.connected)


    socket.on("send-message", (message) => {
        io.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
    });

    socket.on("playerMove", (direction) => {
        let control = controllers[findRoom(socket.id)]
        control.handlePlayerMove(socket.id, direction);
    });

    socket.on("playerRotate", (rotationDirection) => {
        let control = controllers[findRoom(socket.id)]
        control.handlePlayerRotation(socket.id, rotationDirection)
        });

    socket.on("playerFall", () => {
        let control = controllers[findRoom(socket.id)]
        control.handlePlayerFall(socket.id)

    });
    socket.on("roomNumber", (roomSent) => {
            roomNumber = roomSent;
            console.log(roomNumber);
            let room = controllers[roomNumber-1]
            let realList = lists[roomNumber-1]



            console.log(controllers)
            room.addPlayer(socket.id);
            room.addGameboard(socket.id);
            realList.push(socket.id)



        }


    );

    socket.on("playerHold", () => {
        let control = controllers[findRoom(socket.id)]
        control.handleHold(socket.id)

    });

    socket.on("playerDrop", () => {
        let control = controllers[findRoom(socket.id)]
        control.handleDrop(socket.id)


    });

    socket.on("test", () => {
        console.log('testing');
        io.emit("receive-message", "testing ack");
    });

});

const PORT = 25565;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
