import { describe, it, expect } from "vitest";
import { checkGameOver } from "../../../services/worldServices";

describe("checkGameOver", () => {
  it("should end the game when pollution reaches 100", () => {
    const stats = {
      pollution: 100,
      money: 500,
      population: 1000,
    };

    const result = checkGameOver(stats);

    expect(result).toBe("pollution");
  });

  it("should end the game when money is below 0", () => {
    const stats = {
        pollution: 50,
        money: -100,
        population: 1000,
    };

    const result = checkGameOver(stats);

    expect(result).toBe("bankruptcy");
    });

    it("should end the game when population drops below 0", () => {
        const stats = {
            pollution: 50,
            money: 500,
            population: -10,
        };

        const result = checkGameOver(stats);

        expect(result).toBe("population");
    });

    it("should continue the game when all stats are valid", () => {
    const stats = {
        pollution: 50,
        money: 500,
        population: 1000,
    };

    const result = checkGameOver(stats);

    expect(result).toBeNull();
    });




});