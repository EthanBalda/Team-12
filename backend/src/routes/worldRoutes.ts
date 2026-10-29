import express, { type Request, type Response } from 'express';
import { createWorld } from '../services/worldServices';
import { CreateWorldRequest } from '../types/RequestTypes';
import { AppError } from '../middleware/errorHandler';
const worldRouter = express.Router();

/**
 * POST: /worlds/create
 * 
 * Body:
 * worldID: string
 * password: string
 * name: string
 * 
 * Returns:
 * World Object
 */
worldRouter.post("/create", async (req, res, next) => {
    try{
        const { worldID, password, name }: CreateWorldRequest = req.body;

        if(worldID.length == 0 || password.length == 0){
            throw new AppError(400, "Inputs cannot be empty");
        }
        
        const world = await createWorld(worldID, password, name);
        const { passwordHash, ...safeWorld } = world; // removes passwordHash from the response object

        return res.status(201).json({
            success: true, 
            data: safeWorld
        });

    }catch(error){
        next(error);
    }
});

export default worldRouter;