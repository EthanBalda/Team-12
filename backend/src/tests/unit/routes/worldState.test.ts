import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import worldRouter from "../../../routes/worldRoutes";
import { generateWorldToken } from "../../../libs/jwt";
import { errorHandler } from "../../../middleware/errorHandler";
import { prisma } from "../../../libs/db";

vi.mock("../../../libs/db", () => ({
    prisma: { world: { findFirst: vi.fn(), update: vi.fn() } },
}));

const app = express();
app.use(express.json(), cookieParser());
app.use("/worlds", worldRouter);
app.use(errorHandler);
const cookie = () => `world_token=${generateWorldToken("saved-world")}`;
const city = {
    stats: { population: 10000, money: 460000, pollution: 35, year: 3 },
    buildings: [{
        id: "building-7", type: "Factory", district: "south",
        health: 10, maxHealth: 50, populationLoss: 200,
    }],
    nextBuildingId: 9,
};

beforeEach(() => vi.resetAllMocks());

describe("authenticated world city snapshots", () => {
    it("saves and loads buildings and stats on the authenticated world", async () => {
        let saved: unknown;
        vi.mocked(prisma.world.update).mockImplementation((args: any) => {
            saved = args.data.cityState;
            return Promise.resolve({ cityState: saved }) as any;
        });
        vi.mocked(prisma.world.findFirst).mockImplementation(() => Promise.resolve({
            cityState: saved, passwordHash: "must-not-leak",
        }) as any);
        const write = await request(app).put("/worlds/state").set("Cookie", cookie()).send(city);
        expect(write.status).toBe(200);
        expect(prisma.world.update).toHaveBeenCalledWith({
            where: { worldID: "saved-world" }, data: { cityState: city }, select: { cityState: true },
        });
        const read = await request(app).get("/worlds/state").set("Cookie", cookie());
        expect(read.status).toBe(200);
        expect(read.body).toEqual({ cityState: city });
        expect(prisma.world.findFirst).toHaveBeenCalledWith({ where: { worldID: "saved-world" } });
        // Replacing the array after a flood keeps destroyed buildings deleted.
        const destroyed = { ...city, buildings: [] };
        await request(app).put("/worlds/state").set("Cookie", cookie()).send(destroyed);
        expect((await request(app).get("/worlds/state").set("Cookie", cookie())).body)
            .toEqual({ cityState: destroyed });
    });

    it("loads older worlds with no snapshot", async () => {
        vi.mocked(prisma.world.findFirst).mockResolvedValue({ cityState: null } as any);
        expect((await request(app).get("/worlds/state").set("Cookie", cookie())).body)
            .toEqual({ cityState: null });
    });

    it("requires authentication for both reading and saving", async () => {
        expect((await request(app).get("/worlds/state")).status).toBe(401);
        expect((await request(app).put("/worlds/state").send(city)).status).toBe(401);
        expect(prisma.world.update).not.toHaveBeenCalled();
        expect(prisma.world.findFirst).not.toHaveBeenCalled();
    });

    it.each([
        {},
        { ...city, stats: { ...city.stats, year: 0 } },
        { ...city, buildings: [{ ...city.buildings[0], district: "missing" }] },
        { ...city, buildings: [{ ...city.buildings[0], health: 70 }] },
        { ...city, buildings: [city.buildings[0], city.buildings[0]] },
    ])("rejects invalid snapshots without overwriting saved progress", async (invalid) => {
        expect((await request(app).put("/worlds/state").set("Cookie", cookie()).send(invalid)).status)
            .toBe(400);
        expect(prisma.world.update).not.toHaveBeenCalled();
    });
});
