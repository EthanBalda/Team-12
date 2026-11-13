
import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    afterAll,
    beforeEach
} from "vitest";

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../../middleware/errorHandler";

describe("authenticateWorld", () => {
    const secret = "test-jwt-secret";

    let authenticateWorld: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void;

    let req: Request;
    let res: Response;
    let next: NextFunction;
    let nextMock: ReturnType<typeof vi.fn>;

    const createToken = (payload: object = { worldID: "world123" }) => {
        return jwt.sign(payload, secret, {
            algorithm: "HS256",
            expiresIn: "1h"
        });
    };

    beforeAll(async () => {
        vi.stubEnv("JWT_SECRET", secret);
        vi.stubEnv("JWT_EXPIRES_IN", "1h");

        vi.resetModules();

        const module = await import(
            "../../../middleware/authenticateWorld"
        );

        authenticateWorld = module.authenticateWorld;
    });

    beforeEach(() => {
        req = {
            cookies: {}
        } as Request;

        res = {} as Response;

        nextMock = vi.fn();
        next = nextMock as NextFunction;
    });

    afterAll(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("should authenticate a request with a valid token", () => {
        const token = createToken();

        req.cookies = {
            world_token: token
        };

        authenticateWorld(req, res, next);

        expect(req.worldID).toBe("world123");
        expect(nextMock).toHaveBeenCalledOnce();
        expect(nextMock).toHaveBeenCalledWith();
    });

    it("should call next with a 401 error if the token cookie is missing", () => {
        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Authentication required");
    });

    it("should reject an invalid token", () => {
        req.cookies = {
            world_token: "invalid-token"
        };

        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
    });

    it("should reject a token signed with the wrong secret", () => {
        req.cookies = {
            world_token: jwt.sign(
                { worldID: "world123" },
                "incorrect-secret",
                { algorithm: "HS256" }
            )
        };

        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
    });

    it("should reject an expired token", () => {
        req.cookies = {
            world_token: jwt.sign(
                { worldID: "world123" },
                secret,
                {
                    algorithm: "HS256",
                    expiresIn: -1
                }
            )
        };

        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
    });

    it("should reject a token without a worldID", () => {
        req.cookies = {
            world_token: createToken({})
        };

        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Invalid authentication token");
    });

    it("should reject a token with a non-string worldID", () => {
        req.cookies = {
            world_token: createToken({ worldID: 123 })
        };

        authenticateWorld(req, res, next);

        expect(nextMock).toHaveBeenCalledOnce();

        const error = nextMock.mock.calls[0][0] as AppError;

        expect(error.statusCode).toBe(401);
    });

    it("should not attach a worldID when authentication fails", () => {
        req.cookies = {
            world_token: "invalid-token"
        };

        authenticateWorld(req, res, next);

        expect(req.worldID).toBeUndefined();
    });
});
