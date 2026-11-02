import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

//signup new user
export const signup = async(req,res)=>{
    const{fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success:false, message:"Missing Details"})
        }

        const user = await User.findOne({email});
        if(user){
            return res.json({success:false, message:"Already Account Exist"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({success:true, userData: newUser, token, message:"Account Created Successfully"})

    } catch (error) {
        console.log(error.message);
        
        res.json({success:false, message:error.message})
    }
}

//login user

export const login = async(req,res)=>{
    try {
        const{email, password} = req.body;

        const userData = await User.findOne({email});

        const isPassCorrect = await bcrypt.compare(password,userData.password);

        if(!isPassCorrect){
            return res.json({success:true, message:"Invalid Credentials"});
        }

        const token = generateToken(userData._id)

        res.json({success:true, userData, token, message:"Login Successful"})

    } catch (error) {
        console.log(error.message);
        
        res.json({success:false, message:error.message})
    }
}

//controller to check if user is authenticated

export const checkAuth = (req,res)=>{
    res.json({success:true, user:req.user});
}

//controller to update user Details

// export const updateProfile = async (req,res)=>{
//     try {
//         const {profilePic,bio,fullName} = req.body;

//         const userId = req.user._id;
//         let updatedUser;

//         if(!profilePic){
//             updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
//         }
//         else{
//             const upload = await cloudinary.uploader.upload(profilePic);

//             updatedUser = await User.findByIdAndUpdate(userId,{profilePic: upload.secure_url, bio, fullName}, {new:true});
//         }

//         res.json({success:true, user:updatedUser});
//     } catch (error) {
//         console.log(error.message);
//         res.json({success:false, message:error.message});
//     }
// }
export const updateProfile = async (req, res) => {
    try {
        console.log("=== PROFILE UPDATE STARTED ===");

        const { profilePic, bio, fullName } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });
        }

        if (!fullName?.trim() || !bio?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and bio are required"
            });
        }

        const updateData = {
            fullName: fullName.trim(),
            bio: bio.trim()
        };

        // If a new base64 image was uploaded
        if (profilePic && profilePic.startsWith("data:image")) {
            try {
                console.log("Uploading profile pic to Cloudinary...");
                const uploadResult = await cloudinary.uploader.upload(profilePic, {
                    folder: "chat-app/profiles",
                    resource_type: "image",
                    timeout: 60000
                });

                updateData.profilePic = uploadResult.secure_url;
                console.log(" Profile picture uploaded:", uploadResult.secure_url);
            } catch (uploadError) {
                console.error(" CLOUDINARY UPLOAD ERROR:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: uploadError.message || "Cloudinary upload failed"
                });
            }
        }

        // Update MongoDB document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};