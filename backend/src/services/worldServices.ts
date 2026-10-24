import { hashPassword } from "../libs/bcrypt";
import { AppError } from "../middleware/errorHandler";
import { getWorldByWorldId, insertWorld } from "../repositories/worldRepository";

export async function createWorld(worldID: string, password: string, name: string){
    // check database to see if world already exists based on worldID.
    const existingWorld = await getWorldByWorldId(worldID);

    if (existingWorld) {
        throw new AppError(409, "World already exists");
    }

     // take password and get hashed password
    const hashedPassword = await hashPassword(password);

    // if not, create world
    const result = await insertWorld(worldID, hashedPassword, name);
    return result;
}