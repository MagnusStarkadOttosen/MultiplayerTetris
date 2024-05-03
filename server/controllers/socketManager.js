const socketIO = require('socket.io');
const RoomManager = require('./roomManager');

module.exports = function(server) {
    const io = socketIO(server);
    const roomManager = new RoomManager(io);

    io.on('connection', socket => {
        console.log('New player connected', socket.id);

        socket.on('joinRoom', (roomId) => {
            //join the room 
            roomManager.addPlayerToRoom(roomId, socket.id);
            socket.join(roomId);
        });

        socket.on('playerAction', (action, payload) => {
            //get roomId from socket
            let playerRoomId = socket.roomId;
            roomManager.executePlayerAction(playerRoomId, socket.id, action, payload);
        });

        socket.on('disconnect', () => {
        // disconnect player from room
            roomManager.removePlayerFromRoom(socket.roomId, socket.id);
            socket.leave(socket.roomId);
        });
    });

    return io;
};
