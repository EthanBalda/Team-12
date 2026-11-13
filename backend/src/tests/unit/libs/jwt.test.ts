
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import jwt from "jsonwebtoken";

describe("generateWorldToken", () => {
    const mockWorldID = "world123";
    const secret = "test-jwt-secret";
    let generateWorldToken: (worldID: string) => string;

    beforeAll(async () => {
        vi.stubEnv("JWT_SECRET", secret);
        vi.stubEnv("JWT_EXPIRES_IN", "1h");

        vi.resetModules();

        const module = await import("../../../libs/jwt");
        generateWorldToken = module.generateWorldToken;
    });

    afterAll(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("should generate a JWT token", () => {
        const token = generateWorldToken(mockWorldID);

        expect(token).toEqual(expect.any(String));
        expect(token.split(".")).toHaveLength(3);
    });

    it("should include the correct worldID in the token payload", () => {
        const token = generateWorldToken(mockWorldID);

        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

        expect(decoded.worldID).toBe(mockWorldID);
    });

    it("should sign the token using HS256", () => {
        const token = generateWorldToken(mockWorldID);

        const decoded = jwt.decode(token, { complete: true }) as jwt.Jwt;

        expect(decoded.header.alg).toBe("HS256");
    });

    it("should include an expiration time", () => {
        const token = generateWorldToken(mockWorldID);

        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

        expect(decoded.iat).toEqual(expect.any(Number));
        expect(decoded.exp).toEqual(expect.any(Number));
        expect(decoded.exp!).toBeGreaterThan(decoded.iat!);
    });

    it("should generate tokens containing different worldIDs", () => {
        const firstToken = generateWorldToken("world123");
        const secondToken = generateWorldToken("world456");

        const firstDecoded = jwt.verify(firstToken, secret) as jwt.JwtPayload;
        const secondDecoded = jwt.verify(secondToken, secret) as jwt.JwtPayload;

        expect(firstDecoded.worldID).toBe("world123");
        expect(secondDecoded.worldID).toBe("world456");
    });

    it("should generate a token that cannot be verified with an incorrect secret", () => {
        const token = generateWorldToken(mockWorldID);

        expect(() => {
            jwt.verify(token, "incorrect-secret");
        }).toThrow();
    });
});
