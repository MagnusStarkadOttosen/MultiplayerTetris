//This is where the server is

const fs = require("fs"); //Node.js file system
const https = require("https");
const express = require("express");
const socketIo = require("socket.io");

const app = express();

//SSL certification
const options = {
  key: fs.readFileSync("./ssl/private.key"),
  cert: fs.readFileSync("./ssl/certificate.crt")
};

//Create HTTPS server
const server = https.createServer(options, app);
const io = socketIo(server);

//Sends whats in our client to the client.
app.use(express.static("client"));

//WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    //Listen for a client sending something to server. If something is sendt, send something to all clients.
    socket.on("send-message", (message) => {
        io.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));