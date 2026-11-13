import {prisma} from "../libs/db"
import type { Prisma } from "../../prisma/generated/prisma";

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
export async function saveCityState(worldID: string, cityState: Prisma.InputJsonObject) {
    return prisma.world.update({
        where: { worldID },
        data: { cityState },
        select: { cityState: true },
    });
}
