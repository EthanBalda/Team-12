import {prisma} from "../libs/db"

export async function getWorldByWorldId(worldId: string){
    return await prisma.world.findFirst({
        where: {
            worldID: worldId
        }
    })
}

export async function insertWorld(worldId: string, hashedPassword: string, name: string){
    return await prisma.world.create({
        data: {
            worldID: worldId,
            passwordHash: hashedPassword, 
            name: name
        }
    });
}