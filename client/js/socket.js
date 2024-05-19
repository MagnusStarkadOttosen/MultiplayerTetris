import { initializePlayerControls } from './playerControl.js';
import { io } from 'https://cdn.socket.io/4.3.1/socket.io.esm.min.js';

const socket = io('http://dtu62597.eduhost.dk:10311/');
export default socket;



//Sends the players wants to move the piece
export function emitMove(socket,direction){
    socket.emit("playerMove", direction);
}

//Sends that the player wants to rotate the piece
export function emitRotate(socket,rotation){
    socket.emit("playerRotate", rotation);
}

export function emitFall(socket){
    socket.emit("playerFall")
}

export function emitHold(socket){
    socket.emit("playerHold")
}

export function emitDrop(socket){
    socket.emit("playerDrop")
}
export function emitRoom(socket,room){
    socket.emit(room)
}


//Listen for game state updates from the server
// socket.on('game-state', (gameState) => {
//     console.log("Received gamestate from server: ", gameState);
// });

export function emitTest(socket){
    socket.emit("test")
}



