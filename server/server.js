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
    else if (list4.includes(id,0)){
          return 3
    }
    else
        console.log("error in rooms")
    }



io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.connected)


    socket.on("send-message", (message) => {
        io.emit("receive-message", message);

    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
        let roomNum = findRoom(socket.id)
        controllers[roomNum].room= controllers[roomNum].room-1
        controllers[roomNum].removePlayer(socket.id)
    });


    socket.on("playerMove", (direction) => {

        let control = controllers[findRoom(socket.id)]
        if(control.players[socket.id].start && !(control.players[socket.id].gameOver))
            control.handlePlayerMove(socket.id, direction);

    });

    socket.on("playerRotate", (rotationDirection) => {
        let control = controllers[findRoom(socket.id)]
        if(control.players[socket.id].start && !(control.players[socket.id].gameOver))

            control.handlePlayerRotation(socket.id, rotationDirection)
        });

    socket.on("playerFall", () => {
        let control = controllers[findRoom(socket.id)]
        if(control.players[socket.id].start && !(control.players[socket.id].gameOver))

            control.handlePlayerFall(socket.id)

    });
    socket.on("Ready", () => {
        let control = controllers[findRoom(socket.id)]
        control.room=control.room+1;
        let count=control.room
        if(count==2|| count==3|| count==4){
            for(let i = 1;i<=count;i++) {
                let players = Object.values(control.players)
                players[i-1].start=true

            }

        }

    });
    socket.on("roomNumber", (roomSent) => {
            roomNumber = roomSent;
        let list = lists[roomSent-1];
        list.push(socket.id)

        let control = controllers[findRoom(socket.id)]
        control.addPlayer(socket.id);
        control.addGameboard(socket.id);
        console.log(roomNumber);
        }


    );

    socket.on("playerHold", () => {
        let control = controllers[findRoom(socket.id)]
        if(control.players[socket.id].start && !(control.players[socket.id].gameOver))

            control.handleHold(socket.id)

    });

    socket.on("playerDrop", () => {
        let control = controllers[findRoom(socket.id)]
        if(control.players[socket.id].start && !(control.players[socket.id].gameOver))

            control.handleDrop(socket.id)


    });

    socket.on("test", () => {
        console.log('testing');
        io.emit("receive-message", "testing ack");
    });

});

const PORT = 25565;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
