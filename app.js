// initial library installation set up
const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

// messaging/My Network feature
//--------------------------------------------------

// establish connection to new instance "server"
const server = http.createServer(app);

// cors management safe guarding
const io = new Server(server, {
  cors: {
    origin: "https://builders-collective.herokuapp.com",
    methods: ["GET", "POST"],
  },
});

// listening for event with "connection" id
io.on("connection", (socket) => {
  //welcomes current user
  socket.emit("message", "Welcome to the Builders' Collective Chat Stream");

  // broadcast to other users when a new user connects
  socket.broadcast.emit("message", "A user has joined the chat");

  // upon joining a room
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  // Listen for sendMessage() function for message sent from chat room
  socket.on("send_message", (messageData) => {
    socket.to(messageData.room).emit("receive_message", messageData);
  });

  // lets all users know when a user disconnects
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });
});

const PORT = process.env.PORT || 3001;

app.get("/", (_req, res) => {
  res.send("Welcome to the Builders' Collective Deployed Socket Server!");
});

server.listen(PORT, () => {
  console.log(`Builders' Collective Network Chat listening on Port: ${PORT}`);
});
