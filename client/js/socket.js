import { initializePlayerControls } from './playerControl.js';
import { io } from 'https://cdn.socket.io/4.3.1/socket.io.esm.min.js';

const socket = io();

//Initialize controls once the socket is connected
socket.on('connect', () => {
    initializePlayerControls(socket); 
});

//Sends the players wants to move the piece
export function emitMove(direction){
    socket.emit("playerMove", direction);
}

//Sends that the player wants to rotate the piece
export function emitRotate(rotation){
    socket.emit("playerRotate", rotation);
}

export function emitFall(){
    socket.emit("playerFall")
}

export function emitHold(){
    socket.emit("playerHold")
}

export function emitDrop(){
    socket.emit("playerDrop")
}

//Listen for game state updates from the server
socket.on('game-state', (gameState) => {
    console.log("Received gamestate from server: ", gameState);



});

export function emitTest(){
    socket.emit("test")
}

socket.on('receive-message', (message) => {
    console.log("Received from server:", message);
});
