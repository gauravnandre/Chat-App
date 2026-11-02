// import {v2 as cloudinary} from "cloudinary";

// console.log(
//     "Cloudinary config:",
//     process.env.CLOUDINARY_CLOUD_NAME,
//     process.env.CLOUDINARY_API_KEY ? "API key loaded" : "API key missing",
//     process.env.CLOUDINARY_API_SECRET ? "API secret loaded" : "API secret missing"
// );

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export default cloudinary;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    secure: true,
    timeout: 60000,
});

export default cloudinary;