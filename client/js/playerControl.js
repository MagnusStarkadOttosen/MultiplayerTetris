import {emitDrop, emitFall, emitHold, emitMove, emitRotate, emitTest} from "./socket.js";

export function initializePlayerControls(socket){
    document.addEventListener("keydown", event => {

        switch(event.key){
            case "ArrowLeft":
            case "a":
                emitMove(socket,"left");
                break;
            case "ArrowRight":
            case "d":
                emitMove(socket,"right");
                break;
            case "ArrowDown":
            case "s":
                emitFall(socket);
                break;
            case "q":
                emitRotate(socket,"antiClockwise");
                break;
            case "e":
                emitRotate(socket,"clockwise");
                break;
            case " ":
                emitDrop(socket);
                break;
            case "c":
                emitHold(socket);
                break;
            case "t":
                emitTest(socket);
                break;
        }
    })
}
