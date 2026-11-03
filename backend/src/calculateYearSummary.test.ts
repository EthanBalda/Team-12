
import { describe, it, expect } from "vitest";
import { calculateYearSummary } from "./calculateYearSummary.js";
import type { CityState } from "./cityState.js";

// Group together tests for the yearly summary function.
describe("calculateYearSummary", () => {

  // Test that the function correctly calculates changes in city statistics.
  it("should calculate the differences between two city states", () => {

    // The city's statistics before advancing the year.
    const previousState: CityState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // The city's statistics after advancing the year.
    // These are sample values, not actual building calculations.
    const currentState: CityState = {
      year: 2,
      money: 1200,
      happiness: 55,
      population: 110,
      pollution: 15,
    };

    // Generate a summary comparing the two city states.
    const summary = calculateYearSummary(previousState, currentState);

    // Check that the summary shows the correct year.
    expect(summary.year).toBe(2);

    // Check that each statistic's change was calculated correctly.
    expect(summary.changes.money).toBe(200);
    expect(summary.changes.happiness).toBe(5);
    expect(summary.changes.population).toBe(10);
    expect(summary.changes.pollution).toBe(-5);
  });

});
