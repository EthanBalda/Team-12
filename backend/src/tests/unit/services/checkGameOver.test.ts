
import { describe, it, expect } from "vitest";
import { checkGameOver } from "../../../services/worldServices";

describe("checkGameOver", () => {
    it("should return pollution when pollution reaches 100", () => {
        const stats = {
            pollution: 100,
            money: 5000,
            population: 1000,
            year: 2
        };

        const result = checkGameOver(stats);

        expect(result).toBe("pollution");
    });

    it("should return bankruptcy when money is negative", () => {
        const stats = {
            pollution: 50,
            money: -100,
            population: 1000,
            year: 2
        };

        const result = checkGameOver(stats);

        expect(result).toBe("bankruptcy");
    });

    it("should return population when population is negative", () => {
        const stats = {
            pollution: 50,
            money: 5000,
            population: -100,
            year: 2
        };

        const result = checkGameOver(stats);

        expect(result).toBe("population");
    });

    it("should return null when the game is not over", () => {
        const stats = {
            pollution: 50,
            money: 5000,
            population: 1000,
            year: 2
        };

        const result = checkGameOver(stats);

        expect(result).toBeNull();
    });

    it("should return victory after surviving 10 years", () => {
        const stats = {
            pollution: 50,
            money: 5000,
            population: 1000,
            year: 11
        };

        const result = checkGameOver(stats);

        expect(result).toBe("victory");
    });
});
