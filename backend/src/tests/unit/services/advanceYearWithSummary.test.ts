
import { describe, it, expect } from "vitest";
import { advanceYearWithSummary } from "../../../services/advanceYearWithSummary";
import type { WorldState } from "../../../types/worldTypes";

// Tests the complete process of advancing a year
// and generating a summary of the city's changes.
describe("advanceYearWithSummary", () => {

  // Test that advancing a year returns the correct summary.
  it("should advance the year and return a summary", () => {

    // Create a sample city starting in Year 1.
    const world: WorldState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Advance the world by one year and generate its summary.
    const summary = advanceYearWithSummary(world);

    // Check that the game advanced to Year 2.
    expect(summary.year).toBe(2);

    // Verify that the summary contains the original world state.
    expect(summary.previousState).toEqual(world);

    // Verify that the updated world has the correct year.
    expect(summary.currentState.year).toBe(2);

    // For now, no building effects have been applied,
    // so all world statistics should remain unchanged.
    expect(summary.changes).toEqual({
      money: 0,
      happiness: 0,
      population: 0,
      pollution: 0,
    });

    // Make sure the original world object was not modified.
    // This prevents unexpected changes elsewhere in the game.
    expect(world.year).toBe(1);
  });

});
