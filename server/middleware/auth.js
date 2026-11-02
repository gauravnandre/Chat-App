// import User from "../models/user.js";
// import JWT from "jsonwebtoken";

// //middleware to protect routes
// export const protectRoute = async(req,res,next)=>{
//     try {
//         const token = req.headers.token;

//         const decoded = JWT.verify(token,process.env.JWT_SECRET);

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user){
//             return res.json({success:false, message: "User Not Found"});
//         }

//         req.user = user;
//         next();

//     } catch (error) {
//         console.log(error.message);
        
//         return res.json({success:false, message: error.message});
//     }
// }

import User from "../models/user.js";
import JWT from "jsonwebtoken";

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        // Read token from custom header or standard Authorization header
        const token = req.headers.token || req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "No token provided, authorization denied" 
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};