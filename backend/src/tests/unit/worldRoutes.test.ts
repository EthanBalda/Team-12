import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

import worldRouter from "../../routes/worldRoutes";
import { createWorld } from "../../services/worldServices";
import { errorHandler, AppError } from "../../middleware/errorHandler";

vi.mock("../../services/worldServices", () => ({
    createWorld: vi.fn()
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