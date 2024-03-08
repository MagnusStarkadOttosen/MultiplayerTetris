//This is where the server is

const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const path = require('path');

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("send-message", (message) => {
        io.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
    });
});

const PORT = 10310;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
