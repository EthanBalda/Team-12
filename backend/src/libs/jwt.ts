import jwt from "jsonwebtoken";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

export function generateWorldToken(worldID: string){
    
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not defined");
    }

    if(!JWT_EXPIRES_IN){
        throw new Error("JWT_EXPIRES_IN is not defined");
    }

    return jwt.sign(
        { worldID },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}