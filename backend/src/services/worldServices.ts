import { comparePassword, hashPassword } from "../libs/bcrypt";
import { AppError } from "../middleware/errorHandler";
import { getWorldByWorldId, insertWorld } from "../repositories/worldRepository";
import type { WorldState, YearSummary } from "../types/worldTypes";

export async function createWorld(worldID: string, password: string, name: string){
    // check database to see if world already exists based on worldID.
    const existingWorld = await getWorldByWorldId(worldID);

    // throw error if the world already exists
    if (existingWorld) {
        throw new AppError(409, "World already exists");
    }

     // take password and get hashed password
    const hashedPassword = await hashPassword(password);

    // if not, create world
    const result = await insertWorld(worldID, hashedPassword, name);
    return result;
}

export async function loginWorld(worldID: string, password: string){

    const world = await getWorldByWorldId(worldID);

    // check to see if a world with that worldid even exists
    if(!world){
        throw new AppError(401, "Invalid worldID or password");
    }
    
    // check password
    const hashedPassword = world.passwordHash;
    const passwordMatch = await comparePassword(password, hashedPassword);

    if(!passwordMatch){
        throw new AppError(401, "Invalid worldID or password");
    }

    return world;
}

// Compares the world's statistics before and after advancing a year.
export function calculateYearSummary(
  previousState: WorldState,
  currentState: WorldState
): YearSummary {
  return {
    year: currentState.year,
    previousState: { ...previousState },
    currentState: { ...currentState },
    changes: {
      money: currentState.money - previousState.money,
      happiness: currentState.happiness - previousState.happiness,
      population: currentState.population - previousState.population,
      pollution: currentState.pollution - previousState.pollution,
    },
  };
}