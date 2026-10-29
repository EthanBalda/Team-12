
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    constructor(public statusCode: number, message: string){
        super(message);
    }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction){

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = statusCode === 500 ? "Internal server error" : err.message;

    console.error(err);

    res.status(statusCode).json({
        success: false,
        message,
    });
}
