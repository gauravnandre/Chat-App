import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import http from "http";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import { log } from "console";


//create express app and http server
const app = express();
const server = http.createServer(app);

//initalize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

//store online user
export const userSocketMap = {} //{userId : socketId}

//socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("Disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

//middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

//Rotes setup
app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, ()=>console.log("Server is running on PORT : "+PORT));

