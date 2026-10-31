import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { AppError, errorHandler } from "../../middleware/errorHandler";

describe("AppError", () => {
    it("should create an error with the correct status code and message", () => {
        const error = new AppError(404, "World not found");

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("World not found");
    });

    it("should preserve the default error name", () => {
        const error = new AppError(400, "Invalid input");

        expect(error.name).toBe("Error");
    });
});

describe("errorHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        statusMock = vi.fn().mockImplementation(() => mockResponse);
        jsonMock = vi.fn().mockImplementation(() => mockResponse);

        mockRequest = {};

        mockResponse = {
            status: statusMock as Response["status"],
            json: jsonMock as Response["json"]
        };

        mockNext = vi.fn();

        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return the correct status code for an AppError", () => {
        const error = new AppError(404, "World not found");
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should return the correct error message for an AppError", () => {
        const error = new AppError(409, "World already exists");
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: "World already exists"
        });
    });

    it("should return status 500 for an unexpected error", () => {
        const error = new Error("Database connection failed");
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        expect(statusMock).toHaveBeenCalledWith(500);
    });

    it("should hide internal error messages from clients", () => {
        const error = new Error("Sensitive database information");

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: "Internal server error"
        });
    });

    it("should log errors to the console", () => {
        const error = new Error("Test error");
        const consoleSpy = vi.spyOn(console, "error");

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it("should return the correct response structure for a 400 AppError", () => {
        const error = new AppError(400, "Inputs cannot be empty");

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: "Inputs cannot be empty"
        });
    });
});