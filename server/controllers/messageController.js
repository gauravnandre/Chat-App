import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/user.js";
import { io, userSocketMap } from "../server.js";


//get all users except the logged in user
export const getUsersForSidebar = async (req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        //count number of unseen messages
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId:user._id, receiverId:userId, seen:false})

            if(messages.length >0){
                unseenMessages[user._id] = messages.length;
            }
        })

        await Promise.all(promises);
        res.json({success:true, users:filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//get all messages for selected user
export const getMessages = async (req,res)=>{
    try {
        const {id : selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId, receiverId:myId},
            ]
        })
        await Message.updateMany({senderId:selectedUserId, receiverId:myId},{seen:true});
        res.json({success:true,messages})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async (req,res)=>{
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

// send msg to selected user
// export const sendMessage = async (req,res)=>{
//     try {
//         const {image,text} = req.body;
//         const receiverId = req.params.id;
//         const senderId = req.user._id;

//         let imageUrl;
//         if(image){
//             const uploadResponse = await cloudinary.uploadResponse.upload(image);
//             imageUrl = uploadResponse.secure_url;
//         }
//         const newMessage = await Message.create({
//             senderId,
//             receiverId,
//             text,
//             image:imageUrl
//         })

//         //emit the new message to receiver's socket
//         const receiverSocketId = userSocketMap[receiverId];
//         if(receiverSocketId){
//             io.to(receiverSocketId).emit("newMessage",newMessage);
//         } 

//         res.json({success:true, newMessage});

//     } catch (error) {
//         console.log(error.message);
//         res.json({success:false,message:error.message})
//     }
// }
export const sendMessage = async (req, res) => {
    try {
        const { image, text } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        // Ensure at least text or image is present
        if (!text?.trim() && !image) {
            return res.status(400).json({
                success: false,
                message: "Message must contain text or an image"
            });
        }

        let imageUrl = null;

        // Upload image to Cloudinary if sent as base64
        if (image && image.startsWith("data:image")) {
            console.log("Uploading chat image to Cloudinary...");
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat-app/messages",
                resource_type: "image",
                timeout: 60000
            });
            imageUrl = uploadResponse.secure_url;
            console.log(" Chat image uploaded:", imageUrl);
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text?.trim() || "",
            image: imageUrl
        });

        // Emit message to receiver's socket if online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send message"
        });
    }
};