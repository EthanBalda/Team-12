
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

import worldRouter from "../../../routes/worldRoutes";
import { createWorld, loginWorld } from "../../../services/worldServices";
import { generateWorldToken } from "../../../libs/jwt";
import { authenticateWorld } from "../../../middleware/authenticateWorld";
import { errorHandler, AppError } from "../../../middleware/errorHandler";

vi.mock("../../../services/worldServices", () => ({
    createWorld: vi.fn(),
    loginWorld: vi.fn()
}));

vi.mock("../../../libs/jwt", () => ({
    generateWorldToken: vi.fn()
}));

vi.mock("../../../middleware/authenticateWorld", () => ({
    authenticateWorld: vi.fn()
}));

const app = express();

app.use(express.json());
app.use("/worlds", worldRouter);
app.use(errorHandler);

describe("POST /worlds/create", () => {
    const mockRequest = {
        worldID: "world123",
        password: "password123",
        name: "Test World"
    };

    const mockWorld = {
        id: "1",
        worldID: "world123",
        passwordHash: "hashedPassword123",
        name: "Test World"
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully create a world and return status 201", async () => {
        vi.mocked(createWorld).mockResolvedValue(mockWorld as any);

        const response = await request(app).post("/worlds/create").send(mockRequest);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            data: {
                id: "1",
                worldID: "world123",
                name: "Test World"
            }
        });
        expect(createWorld).toHaveBeenCalledOnce();
        expect(createWorld).toHaveBeenCalledWith(
            mockRequest.worldID,
            mockRequest.password,
            mockRequest.name
        );
    });

    it("should not return passwordHash in the response", async () => {
        vi.mocked(createWorld).mockResolvedValue(mockWorld as any);
        const response = await request(app).post("/worlds/create").send(mockRequest);
        expect(response.status).toBe(201);
        expect(response.body.data).not.toHaveProperty("passwordHash");
    });

    it("should return status 400 if worldID is empty", async () => {
        const response = await request(app).post("/worlds/create").send({...mockRequest, worldID: ""});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Inputs cannot be empty"
        });

        expect(createWorld).not.toHaveBeenCalled();
    });

    it("should return status 400 if password is empty", async () => {
        const response = await request(app).post("/worlds/create").send({...mockRequest, password: ""});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Inputs cannot be empty"
        });
        expect(createWorld).not.toHaveBeenCalled();
    });

    it("should return status 409 if the world already exists", async () => {
        vi.mocked(createWorld).mockRejectedValue(new AppError(409, "World already exists"));
        const response = await request(app).post("/worlds/create").send(mockRequest);
        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "World already exists"
        });
    });

    it("should return status 500 if an unexpected error occurs", async () => {
        vi.mocked(createWorld).mockRejectedValue(new Error("Unexpected database error"));
        const response = await request(app).post("/worlds/create").send(mockRequest);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Internal server error"
        });
    });
});

describe("POST /worlds/login", () => {
    const mockRequest = {
        worldID: "world123",
        password: "password123"
    };

    const mockWorld = {
        id: "1",
        worldID: "world123",
        passwordHash: "hashedPassword123",
        name: "Test World"
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(generateWorldToken).mockReturnValue("mock-jwt-token");
    });

    it("should successfully log in a world and return status 200", async () => {
        vi.mocked(loginWorld).mockResolvedValue(mockWorld as any);

        const response = await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: {
                id: "1",
                worldID: "world123",
                name: "Test World"
            }
        });

        expect(loginWorld).toHaveBeenCalledOnce();
        expect(loginWorld).toHaveBeenCalledWith(
            mockRequest.worldID,
            mockRequest.password
        );

        expect(generateWorldToken).toHaveBeenCalledOnce();
        expect(generateWorldToken).toHaveBeenCalledWith("world123");
    });

    it("should not return passwordHash in the response", async () => {
        vi.mocked(loginWorld).mockResolvedValue(mockWorld as any);

        const response = await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(response.status).toBe(200);
        expect(response.body.data).not.toHaveProperty("passwordHash");
    });

    it("should set an HTTP-only world_token cookie", async () => {
        vi.mocked(loginWorld).mockResolvedValue(mockWorld as any);

        const response = await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(response.status).toBe(200);

        const cookies = response.headers["set-cookie"] as unknown as string[];

        const worldCookie = cookies.find(cookie =>
            cookie.includes("world_token=")
        );

        expect(worldCookie).toBeDefined();
        expect(worldCookie).toContain("world_token=mock-jwt-token");
        expect(worldCookie).toContain("HttpOnly");
        expect(worldCookie).toContain("SameSite=Lax");
    });

    it("should return status 400 if worldID is empty", async () => {
        const response = await request(app)
            .post("/worlds/login")
            .send({ ...mockRequest, worldID: "" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Inputs cannot be empty"
        });

        expect(loginWorld).not.toHaveBeenCalled();
    });

    it("should return status 400 if password is empty", async () => {
        const response = await request(app)
            .post("/worlds/login")
            .send({ ...mockRequest, password: "" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Inputs cannot be empty"
        });

        expect(loginWorld).not.toHaveBeenCalled();
    });

    it("should return status 401 if credentials are incorrect", async () => {
        vi.mocked(loginWorld).mockRejectedValue(
            new AppError(401, "Invalid worldID or password")
        );

        const response = await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid worldID or password"
        });
    });

    it("should return status 500 if an unexpected error occurs", async () => {
        vi.mocked(loginWorld).mockRejectedValue(
            new Error("Unexpected database error")
        );

        const response = await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Internal server error"
        });
    });

    it("should not generate a token if login fails", async () => {
        vi.mocked(loginWorld).mockRejectedValue(
            new AppError(401, "Invalid worldID or password")
        );

        await request(app)
            .post("/worlds/login")
            .send(mockRequest);

        expect(generateWorldToken).not.toHaveBeenCalled();
    });
});

describe("GET /worlds/me", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(authenticateWorld).mockImplementation((req, res, next) => {
            req.worldID = "world123";
            next();
        });
    });

    it("should return the authenticated worldID", async () => {
        const response = await request(app).get("/worlds/me");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            worldID: "world123"
        });

        expect(authenticateWorld).toHaveBeenCalledOnce();
    });

    it("should return status 401 if authentication fails", async () => {
        vi.mocked(authenticateWorld).mockImplementation((req, res, next) => {
            next(new AppError(401, "Authentication required"));
        });

        const response = await request(app).get("/worlds/me");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Authentication required"
        });
    });
});

describe("POST /worlds/logout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully log out and return status 200", async () => {
        const response = await request(app).post("/worlds/logout");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Logged out successfully"
        });
    });

    it("should clear the world_token cookie", async () => {
        const response = await request(app).post("/worlds/logout");

        expect(response.status).toBe(200);

        const cookies = response.headers["set-cookie"] as unknown as string[];

        const worldCookie = cookies.find(cookie =>
            cookie.includes("world_token=")
        );

        expect(worldCookie).toBeDefined();
        expect(worldCookie).toContain("HttpOnly");
        expect(worldCookie).toContain("SameSite=Lax");
        expect(worldCookie).toContain("Expires=");
    });
});
