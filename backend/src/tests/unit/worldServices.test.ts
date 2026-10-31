import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWorld } from "../../services/worldServices";
import { hashPassword } from "../../libs/bcrypt";
import { getWorldByWorldId, insertWorld } from "../../repositories/worldRepository";
import { AppError } from "../../middleware/errorHandler";

vi.mock("../../libs/bcrypt", () => ({
    hashPassword: vi.fn()
}));

vi.mock("../../repositories/worldRepository", () => ({
    getWorldByWorldId: vi.fn(),
    insertWorld: vi.fn()
}));

describe("createWorld", () => {
    const mockWorldID = "world123";
    const mockPassword = "password123";
    const mockHashedPassword = "hashedPassword123";
    const mockName = "Test World";

    const mockWorld = {
        worldID: mockWorldID,
        passwordHash: mockHashedPassword,
        name: mockName
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should successfully create a world", async () => {
        vi.mocked(getWorldByWorldId).mockResolvedValue(null);
        vi.mocked(hashPassword).mockResolvedValue(mockHashedPassword);
        vi.mocked(insertWorld).mockResolvedValue(mockWorld as any);

        const result = await createWorld(mockWorldID, mockPassword, mockName);

        expect(getWorldByWorldId).toHaveBeenCalledOnce();
        expect(getWorldByWorldId).toHaveBeenCalledWith(mockWorldID);

        expect(hashPassword).toHaveBeenCalledOnce();
        expect(hashPassword).toHaveBeenCalledWith(mockPassword);

        expect(insertWorld).toHaveBeenCalledOnce();
        expect(insertWorld).toHaveBeenCalledWith(mockWorldID, mockHashedPassword, mockName);

        expect(result).toEqual(mockWorld);
    });

    it("should throw a 409 error if the world already exists", async () => {
        vi.mocked(getWorldByWorldId).mockResolvedValue(mockWorld as any);

        await expect(createWorld(mockWorldID, mockPassword, mockName)).rejects.toThrow("World already exists");

        expect(hashPassword).not.toHaveBeenCalled();
        expect(insertWorld).not.toHaveBeenCalled();
    });

    it("should throw an AppError with status code 409 if the world exists", async () => {
        vi.mocked(getWorldByWorldId).mockResolvedValue(mockWorld as any);

        try {
            await createWorld(mockWorldID, mockPassword, mockName);
            expect.fail("Expected createWorld to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(409);
            expect((error as Error).message).toBe("World already exists");
        }
    });

    it("should not insert a world if password hashing fails", async () => {
        vi.mocked(getWorldByWorldId).mockResolvedValue(null);
        vi.mocked(hashPassword).mockRejectedValue(new Error("Password hashing failed"));

        await expect(createWorld(mockWorldID, mockPassword, mockName)).rejects.toThrow("Password hashing failed");

        expect(insertWorld).not.toHaveBeenCalled();
    });

    it("should propagate database insertion errors", async () => {
        vi.mocked(getWorldByWorldId).mockResolvedValue(null);
        vi.mocked(hashPassword).mockResolvedValue(mockHashedPassword);
        vi.mocked(insertWorld).mockRejectedValue(new Error("Database insertion failed"));

        await expect(createWorld(mockWorldID, mockPassword, mockName)).rejects.toThrow("Database insertion failed");
    });

    it("should not hash or insert if the database lookup fails", async () => {
        vi.mocked(getWorldByWorldId).mockRejectedValue(new Error("Database lookup failed"));

        await expect(createWorld(mockWorldID, mockPassword, mockName)).rejects.toThrow("Database lookup failed");

        expect(hashPassword).not.toHaveBeenCalled();
        expect(insertWorld).not.toHaveBeenCalled();
    });
});