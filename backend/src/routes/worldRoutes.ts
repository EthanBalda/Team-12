import express, { type Request, type Response } from 'express';
import { createWorld } from '../services/worldServices';
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
        const { worldID, password, name } = req.body;
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