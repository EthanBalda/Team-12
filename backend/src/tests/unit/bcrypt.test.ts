import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { hashPassword } from "../../libs/bcrypt";

describe("hashPassword", () => {
    const mockPassword = "password123";
    const mockIncorrectPassword = "password12";

    it("should generate a valid bcrypt hash", async () => {
        const hashed = await hashPassword(mockPassword);

        expect(hashed).toBeDefined();
        expect(typeof hashed).toBe("string");
        expect(hashed).not.toBe(mockPassword);
    }, 30_000);

    it("should generate a different hash each time", async () => {
        const firstHash = await hashPassword(mockPassword);
        const secondHash = await hashPassword(mockPassword);

        expect(firstHash).not.toBe(secondHash);
    }, 30_000);

    it("should successfully compare the correct password", async () => {
        const hashed = await hashPassword(mockPassword);

        const result = await bcrypt.compare(mockPassword, hashed);

        expect(result).toBe(true);
    }, 30_000);

    it("should return false when comparing an incorrect password", async () => {
        const hashed = await hashPassword(mockPassword);

        const result = await bcrypt.compare(mockIncorrectPassword, hashed);

        expect(result).toBe(false);
    }, 30_000);
});