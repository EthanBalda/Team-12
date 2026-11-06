import express, { type Request, type Response } from 'express';
import { createWorld, loginWorld } from '../services/worldServices';
import { CreateWorldRequest, LoginWorldRequest } from '../types/requestTypes';
import { AppError } from '../middleware/errorHandler';
import { generateWorldToken } from '../libs/jwt';
// import { authenticateWorld } from '../middleware/authenticateWorld';

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

worldRouter.get("/login", async(req, res, next) => {
    try{
        const { worldID, password }: LoginWorldRequest = req.body;

        if(worldID.length == 0 || password.length == 0){
            throw new AppError(400, "Inputs cannot be empty");
        }

        const world = await loginWorld(worldID, password);

        const token = generateWorldToken(world.worldID);

        // attach jwt as http only cookie
        res.cookie("world_token", token, {
            httpOnly: true,
            secure: false, // we are never going to be hosting this anywhere so it should be fine
            sameSite: "lax",
            maxAge: 7*24*60*60, // like 7 days should be good
        });
        
        const { passwordHash, ...safeWorld } = world; // removes passwordHash from the response object

        return res.status(201).json({
            success: true,
            data: safeWorld
        });

    }catch(error){
        next(error);
    }
});
// every other endpoint other than login and register should use the authenticateWorld like this:
// worldRouter.get("/stats", authenticateWorld, async(req, res, next) => {

// });


export default worldRouter;