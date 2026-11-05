import type {WorldState} from "../types/worldTypes";

export function advanceYear(world: WorldState): WorldState{
    if (!Number.isInteger(world.year) || world.year < 1){
        throw new Error("Invalid world year");
    }




    return{
        ...world, 
        year: world.year + 1,
    };
}