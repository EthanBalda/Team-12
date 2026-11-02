
import { describe, it, expect } from "vitest";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";

describe("MainGameScreenModel - End Year", () => {
    it("should advance the year by one", () => {
        // Create a new game model.
        const model = new MainGameScreenModel();

        // Save the starting year.
        const startingYear = model.getStats().year;

        // Advance the game by one year.
        model.endYear();

        // Check that the year increased by exactly one.
        expect(model.getStats().year).toBe(startingYear + 1);
    });

    
it("should update city stats when advancing the year", () => {
    // Create a new game model and save its initial stats.
    const model = new MainGameScreenModel();
    const before = model.getStats();

    // Advance the game by one year.
    model.endYear();

    // Get the updated city stats.
    const after = model.getStats();

    // Population should increase by approximately 2%.
    const expectedPopulation =
        before.population + Math.round(before.population * 0.02);

    // Money increases based on the updated population.
    const expectedMoney = before.money + expectedPopulation * 2;

    // Pollution increases by 2 but cannot exceed 100.
    const expectedPollution = Math.min(100, before.pollution + 2);

    // Verify all three stats were updated correctly.
    expect(after.population).toBe(expectedPopulation);
    expect(after.money).toBe(expectedMoney);
    expect(after.pollution).toBe(expectedPollution);
});

});
