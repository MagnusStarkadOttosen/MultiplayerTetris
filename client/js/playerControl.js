
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
            case "e":
                emitRotate("clockwise");
            case " ":
                emitDrop();
            case "c":
                emitHold();
        }
    })
}
