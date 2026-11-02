// import {createContext, useState, useEffect} from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import {io} from 'socket.io-client'


// const backendurl = import.meta.env.VITE_BACKEND_URL;
// axios.defaults.baseURL = backendurl;
// export const AuthContext = createContext();

// export const AuthProvider = ({children})=>{

//     const [token, settoken] = useState(localStorage.getItem("token"));
//     const [authUser, setauthUser] = useState(null);
//     const [onlineUsers, setonlineUsers] = useState([]);
//     const [socket, setsocket] = useState(null);

//     //Check if user is authenticated and if so, set the user data and connect the socket
//     const checkAuth = async()=>{
//         try {
//             const {data} = await axios.get("/api/auth/check");
//             if(data.success){
//                 setauthUser(data.user);
//                 connectSocket(data.user);
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     //login function to handle user authentication and socket connection
//     const login = async (state,credentials)=>{
//         try {
//             const {data} = await axios.post(`/api/auth/${state}`,credentials);
//             if(data.success){
//                 setauthUser(data.userData);
//                 connectSocket(data.userData);
//                 axios.defaults.headers.common["token"] = data.token;
//                 settoken(data.token);
//                 localStorage.setItem("token",data.token);
//                 toast.success(data.message);
//             }
//             else{
//                 toast.error(data.message);
//             }
//         } catch (error) {
//             console.log("AUTH ERROR:", error.response?.data || error);
//             toast.error(
//                 error.response?.data?.message || error.message
//             );
//         }
//     }

//     //logout function
//     const logout = async()=>{
//         localStorage.removeItem("token");
//         settoken(null);
//         setauthUser(null);
//         setonlineUsers([]);
//         axios.defaults.headers.common["token"] = null;
//         toast.success("Logged Out Successfully");
//         socket.disconnect();
//     }

//     //update profile function
//     // const updateProfile = async(body)=>{
//     //     try {
//     //         const {data} = await axios.put("/api/auth/update-profile",body);
//     //         if(data.success){
//     //             setauthUser(data.user);
//     //             toast.success("Profile Updated Successfully")
//     //         }
//     //     } catch (error) {
//     //         toast.error(error.message);
//     //     }
//     // }
//     const updateProfile = async(body)=>{
//         try {
//             const {data} = await axios.put("/api/auth/update-profile", body);
//             if(data.success){
//                 setauthUser(data.user);
//                 toast.success("Profile Updated Successfully");
//             }
//         } catch (error) {
//             console.error("Profile update error:", error.response?.data || error);
//             toast.error(error.response?.data?.message || error.message);
//         }
//     }

//     //connect socket function to handle socket connection and online users update
//     const connectSocket = (userData)=>{
//         if(!userData || socket?.connected) return;
//         const newSocket = io(backendurl,{
//             query:{
//                 userId: userData._id,
//             }
//         })
//         newSocket.connect();
//         setsocket(newSocket);

//         newSocket.on("getOnlineUsers", (userIds)=>{
//             setonlineUsers(userIds);
//         })
//     }

//     useEffect(() => {
//       if(token){
//         axios.defaults.headers.common["token"] = token;
//       }
//       checkAuth();
//     }, [])
    

//     const value = {
//         axios,
//         authUser,
//         onlineUsers,
//         socket,
//         login,
//         logout,
//         updateProfile
//     }

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backendurl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendurl;

// Helper to get active token
const getActiveToken = () => localStorage.getItem("token");

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, settoken] = useState(getActiveToken());
    const [authUser, setauthUser] = useState(null);
    const [onlineUsers, setonlineUsers] = useState([]);
    const [socket, setsocket] = useState(null);

    // Check if user is authenticated
    const checkAuth = async () => {
        const storedToken = getActiveToken();
        if (!storedToken) return;

        try {
            const { data } = await axios.get("/api/auth/check", {
                headers: { token: storedToken }
            });
            if (data.success) {
                setauthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.log("checkAuth error:", error.message);
        }
    };

    // Login function
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setauthUser(data.userData);
                connectSocket(data.userData);
                settoken(data.token);
                localStorage.setItem("token", data.token);
                axios.defaults.headers.common["token"] = data.token;
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log("AUTH ERROR:", error.response?.data || error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Logout function
    const logout = async () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];
        settoken(null);
        setauthUser(null);
        setonlineUsers([]);
        toast.success("Logged Out Successfully");
        if (socket) socket.disconnect();
    };

    // Update profile function
    const updateProfile = async (body) => {
        try {
            const currentToken = token || getActiveToken();
            if (!currentToken) {
                toast.error("You are not logged in");
                return;
            }

            const { data } = await axios.put("/api/auth/update-profile", body, {
                headers: { token: currentToken }
            });

            if (data.success) {
                setauthUser(data.user);
                toast.success("Profile Updated Successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Profile update error:", error.response?.data || error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Connect socket function
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendurl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setsocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setonlineUsers(userIds);
        });
    };

    useEffect(() => {
        const storedToken = getActiveToken();
        if (storedToken) {
            axios.defaults.headers.common["token"] = storedToken;
        }
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};