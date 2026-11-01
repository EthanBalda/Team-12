import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../libs/db";
import { getWorldByWorldId, insertWorld } from "../../repositories/worldRepository";

vi.mock("../../libs/db", () => ({
    prisma: {
        world: {
            findFirst: vi.fn(),
            create: vi.fn()
        }
    }
}));

describe("worldRepository", () => {
    const mockWorldID = "world123";
    const mockHashedPassword = "hashedPassword123";
    const mockName = "Test World";

    const mockWorld = {
        id: "1",
        worldID: mockWorldID,
        passwordHash: mockHashedPassword,
        name: mockName
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getWorldByWorldId", () => {
        it("should query Prisma using the correct world ID", async () => {
            vi.mocked(prisma.world.findFirst).mockResolvedValue(mockWorld as any);
            await getWorldByWorldId(mockWorldID);
            expect(prisma.world.findFirst).toHaveBeenCalledOnce();
            expect(prisma.world.findFirst).toHaveBeenCalledWith({
                where: {
                    worldID: mockWorldID
                }
            });
        });

        it("should return the world if it exists", async () => {
            vi.mocked(prisma.world.findFirst).mockResolvedValue(mockWorld as any);
            const result = await getWorldByWorldId(mockWorldID);
            expect(result).toEqual(mockWorld);
        });

        it("should return null if the world does not exist", async () => {
            vi.mocked(prisma.world.findFirst).mockResolvedValue(null);

            const result = await getWorldByWorldId(mockWorldID);

            expect(result).toBeNull();
        });

        it("should propagate database errors", async () => {
            vi.mocked(prisma.world.findFirst).mockRejectedValue(new Error("Database error"));
            await expect(getWorldByWorldId(mockWorldID)).rejects.toThrow("Database error");
        });
    });

    describe("insertWorld", () => {
        it("should create a world with the correct data", async () => {
            vi.mocked(prisma.world.create).mockResolvedValue(mockWorld as any);
            await insertWorld(mockWorldID, mockHashedPassword, mockName);
            expect(prisma.world.create).toHaveBeenCalledOnce();
            expect(prisma.world.create).toHaveBeenCalledWith({
                data: {
                    worldID: mockWorldID,
                    passwordHash: mockHashedPassword,
                    name: mockName
                }
            });
        });

        it("should return the newly created world", async () => {
            vi.mocked(prisma.world.create).mockResolvedValue(mockWorld as any);
            const result = await insertWorld(mockWorldID, mockHashedPassword, mockName);
            expect(result).toEqual(mockWorld);
        });

        it("should propagate database creation errors", async () => {
            vi.mocked(prisma.world.create).mockRejectedValue(new Error("Database creation failed"));
            await expect(insertWorld(mockWorldID, mockHashedPassword, mockName)).rejects.toThrow("Database creation failed");
        });
    });
});