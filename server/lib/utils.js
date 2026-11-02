import JWT from "jsonwebtoken";

//functio to generate a token for user

export const generateToken = (userId)=>{
    const token = JWT.sign({userId}, process.env.JWT_SECRET);
    return token;
}