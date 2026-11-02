import {createContext, useState, useContext, useEffect} from 'react';
import { AuthContext } from './authContext.jsx';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({children})=>{

    const [messages, setmessages] = useState([]);
    const [users, setusers] = useState([]);
    const [selectedUser, setselectedUser] = useState(null);
    const [unseenMessages, setunseenMessages] = useState({});


    const {socket, axios} = useContext(AuthContext);

    //get all users for Sidebar
    const getUsers = async ()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setusers(data.users);
                setunseenMessages(data.unseenMessages);
            } 
        } catch (error) {
            toast.error(error.message);
        }
    }

    //func to get messages for selected users
    const getMessages = async (userId) =>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setmessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //func to send msg to selected user
    const sendMessage = async (messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                setmessages((prevMessages)=>[...prevMessages,data.newMessage])
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // to subscribe to message for slected user
    const subscribeToMessage = async ()=>{
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage. seen = true;
                setmessages((prevMessages)=>[...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else{
                setunseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] +1 : 1
                }))
            }
        })
    }

    //to unsubscribe the msg for selected user
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessage();
      return () => unsubscribeFromMessages();
    }, [socket,selectedUser])
    

    const value = {
        messages,users,selectedUser,getUsers,getMessages,sendMessage,setselectedUser,unseenMessages,setunseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}
