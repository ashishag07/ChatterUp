import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import chatModel from "./src/features/chat.schema.js";
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = [];
io.on("connection", (socket) => {
  console.log("Connection made !!");

  socket.on("join_room", async (data) => {
    // join the room
    socket.join(data.roomId);

    // new joined user object
    const user = {
      username: data.username,
      img: data.imgUrl,
      room: data.roomId,
      socketId: socket.id,
    };

    // find the newly joined user index
    const existedUser = onlineUsers.findIndex(
      (item) => item.username == data.username
    );

    // if newly joined user does not exist in online users array, then only push into the array
    if (existedUser == -1) {
      // push the newly joined user to the online user array
      onlineUsers.push(user);
    }

    // after joining the room emit the join notification
    io.to(data.roomId).emit(
      "join_notification",
      `${data.username} has joined the chat room !!`
    );

    // emit the online users array
    io.to(data.roomId).emit("online_users", onlineUsers);

    // on join load the previou chat
    const previousChat = await chatModel.find();

    socket.emit("previous_chat", previousChat);
  });

  socket.on("message_data", async (room, data) => {
    // on message data reception, add into database
    const newMessageObj = {
      message: data.message,
      username: data.username,
      img: data.img,
      createdAt: data.time,
    };

    // give the newMessageObj to the chat model
    const newMessage = new chatModel(newMessageObj);
    await newMessage.save();

    io.to(room).emit("sendMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("Connection diconnected");

    // Find the existed user index
    const existedUserIndex = onlineUsers.findIndex(
      (item) => item.socketId == socket.id
    );

    // check if the user already exists
    if (existedUserIndex != -1) {
      const existedUser = onlineUsers[existedUserIndex];

      // on disconnection, remove the user from the online users array
      onlineUsers.splice(existedUserIndex, 1);

      // emit the notification
      io.to(existedUser.room).emit(
        "join_notification",
        `${existedUser.username} has left the chat room !!`
      );

      // emit the new online users array
      io.to(existedUser.room).emit("online_users", onlineUsers);
    }
  });
});

export default server;
