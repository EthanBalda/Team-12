import express, { type Request, type Response } from 'express';
import { createWorld, loginWorld } from '../services/worldServices';
import { CreateWorldRequest, LoginWorldRequest } from '../types/requestTypes';
import { AppError } from '../middleware/errorHandler';
import { generateWorldToken } from '../libs/jwt';
import { authenticateWorld } from '../middleware/authenticateWorld';
import { getWorldByWorldId, saveCityState } from '../repositories/worldRepository';
import { validateCityState } from '../services/cityState';

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

worldRouter.post("/login", async(req, res, next) => {
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

worldRouter.get("/me", authenticateWorld, async(req, res, next) => {
    
    try{
        return res.status(200).json({
            success: true,
            worldID: req.worldID,
        });
    } catch (error) {
        next(error);
    }

});

worldRouter.get("/state", authenticateWorld, async (req, res, next) => {
    try {
        const world = await getWorldByWorldId(req.worldID!);
        if (!world) throw new AppError(404, "World not found");
        return res.json({ cityState: world.cityState ?? null });
    } catch (error) {
        next(error);
    }
});

worldRouter.put("/state", authenticateWorld, async (req, res, next) => {
    try {
        validateCityState(req.body);
        await saveCityState(req.worldID!, req.body);
        return res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

worldRouter.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("world_token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

// every other endpoint other than login and register should use the authenticateWorld like this:
// worldRouter.get("/stats", authenticateWorld, async(req, res, next) => {

// });


export default worldRouter;