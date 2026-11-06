import { Request, Response, NextFunction } from "express";
import "cookie-parser";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
}

if(!JWT_EXPIRES_IN){
    throw new Error("JWT_EXPIRES_IN is not defined");
}

export function authenticateWorld(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // get the world token from cookie
    const worldToken = req.cookies?.world_token;

    if(!worldToken){
        return new AppError(401, "Authentication required");
    }

    // verify the jwt token
    const decoded = jwt.verify(worldToken, JWT_SECRET, { algorithms: ["HS256"] });

    if(typeof decoded === "string" || typeof decoded.worldID !== "string" || !decoded.worldID){
        throw new AppError(401, "Invalid authentication token");
    }

    // append the worldID
    req.worldID = decoded.worldID;

    next();
}
