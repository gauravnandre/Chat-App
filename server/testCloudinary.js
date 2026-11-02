import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "./lib/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const testUpload = async () => {
    try {
        console.log("Testing upload with cloud:", process.env.CLOUDINARY_CLOUD_NAME?.trim());
        
        // Use a lightweight online sample or base64 with explicit timeout
        const res = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            {
                folder: "chat-app/test",
                timeout: 60000
            }
        );

        console.log(" SUCCESS! Image uploaded to new account:", res.secure_url);
    } catch (err) {
        console.error(" UPLOAD FAILED:", err);
    }
};

testUpload();