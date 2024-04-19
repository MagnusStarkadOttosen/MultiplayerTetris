import { emitTest, emitMove, emitRotate, emitFall, emitHold, emitDrop } from "./socket.js";

export function initializePlayerControls(socket){
    document.addEventListener("keydown", event => {

        switch(event.key){
            case "ArrowLeft":
            case "a":
                emitMove("left");
                break;
            case "ArrowRight":
            case "d":
                emitMove("right");
                break;
            case "ArrowDown":
            case "s":
                emitFall();
                break;
            case "q":
                emitRotate("antiClockwise");
                break;
            case "e":
                emitRotate("clockwise");
                break;
            case " ":
                emitDrop();
                break;
            case "c":
                emitHold();
                break;
            case "t":
                emitTest();
                break;
        }
    })
}
