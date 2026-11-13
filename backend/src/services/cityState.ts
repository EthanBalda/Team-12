import type { Prisma } from "../../prisma/generated/prisma";
import { AppError } from "../middleware/errorHandler";

// Validate the JSON snapshot before replacing a world's saved city.
export function validateCityState(value: unknown): asserts value is Prisma.InputJsonObject {
    const state = value as Record<string, any> | null;
    const stats = state?.stats;
    const validStats = stats &&
        [stats.population, stats.money, stats.pollution, stats.year].every(Number.isSafeInteger) &&
        stats.population >= 0 && stats.money >= 0 &&
        stats.pollution >= 0 && stats.pollution <= 100 && stats.year >= 1;
    const buildings = state?.buildings ?? [];
    const validBuildings = Array.isArray(buildings) && buildings.every((building) =>
        building && /^building-[1-9]\d*$/.test(building.id) &&
        Number.isSafeInteger(Number(building.id.slice(9))) &&
        typeof building.type === "string" && building.type.length > 0 &&
        ["north", "south", "east", "west"].includes(building.district) &&
        Number.isSafeInteger(building.health) && building.health > 0 &&
        Number.isSafeInteger(building.maxHealth) && building.maxHealth >= building.health &&
        Number.isSafeInteger(building.populationLoss) && building.populationLoss >= 0,
    ) && new Set(buildings.map((building) => building.id)).size === buildings.length;
    const nextId = state?.nextBuildingId;
    if (!validStats || !validBuildings ||
        (nextId !== undefined && (!Number.isSafeInteger(nextId) || nextId < 1))) {
        throw new AppError(400, "Invalid city state");
    }
}
