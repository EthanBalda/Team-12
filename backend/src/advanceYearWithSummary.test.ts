
import { describe, it, expect } from "vitest";
import { advanceYearWithSummary } from "./advanceYearWithSummary.js";
import type { CityState } from "./cityState.js";

// Tests the complete process of advancing a year
// and generating a summary of the city's changes.
describe("advanceYearWithSummary", () => {

  // Test that advancing a year returns the correct summary.
  it("should advance the year and return a summary", () => {

    // Create a sample city starting in Year 1.
    const city: CityState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Advance the city by one year and generate its summary.
    const summary = advanceYearWithSummary(city);

    // Check that the game advanced to Year 2.
    expect(summary.year).toBe(2);

    // Verify that the summary contains the original city state.
    expect(summary.previousState).toEqual(city);

    // Verify that the updated city has the correct year.
    expect(summary.currentState.year).toBe(2);

    // For now, no building effects have been applied,
    // so all city statistics should remain unchanged.
    expect(summary.changes).toEqual({
      money: 0,
      happiness: 0,
      population: 0,
      pollution: 0,
    });

    // Make sure the original city object was not modified.
    // This prevents unexpected changes elsewhere in the game.
    expect(city.year).toBe(1);
  });

});
