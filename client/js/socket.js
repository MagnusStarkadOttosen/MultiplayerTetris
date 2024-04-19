import { initializePlayerControls } from './playerControl.js';

const socket = io();

//Initialize controls once the socket is connected
socket.on('connect', () => {
    initializePlayerControls(socket); 
});

//Sends the players wants to move the piece
function emitMove(direction){
    socket.emit("playerMove", direction);
}

//Sends that the player wants to rotate the piece
function emitRotate(rotation){
    socket.emit("playerRotate", rotation);
}

function emitFall(){
    socket.emit("playerFall")
}

function emitHold(){
    socket.emit("playerHold")
}

function emitDrop(){
    socket.emit("playerDrop")
}

//Listen for game state updates from the server
socket.on('gameState', (gameState) => {
    //TODO: update rendering based on gamestate
});

export function emitTest(){
    socket.emit("test")
}