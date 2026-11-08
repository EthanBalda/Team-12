
import { describe, it, expect } from "vitest";
import { advanceYear } from "../../../services/advanceYear";
import type { WorldState } from "../../../types/worldTypes";

// Group together tests for the advanceYear function.
describe("advanceYear", () => {

  // ---------- TEST ! ----------
  // Test that advancing the year increases it by exactly one.
  it("should increase the year by 1", () => {

    // Create a sample world to use for testing.
    const world: WorldState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Call the function to advance the world's year.
    const updatedWorld = advanceYear(world);

    // Check that the new year is 2.
    expect(updatedWorld.year).toBe(2);
  });


  // ---------- TEST 2 ----------
  // Test that the game rejects invalid year values.
  it("should throw an error for an invalid year", () => {

    // Create a sample world with an invalid starting year.
    const world: WorldState = {
      year: -1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Check that advanceYear throws an error instead of advancing.
    expect(() => advanceYear(world)).toThrow("Invalid world year");
  });

  
  // ---------- TEST 3 ----------
  // Test that advancing the year doesn't accidentally change world statistics.
  it("should preserve world statistics when advancing the year", () => {

    // Create a sample world with starting values for each statistic.
    const world: WorldState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Advance the world by one year.
    const updatedWorld = advanceYear(world);

    // Make sure the statistics remain unchanged for now.
    // Building effects will be added later when that system is ready.
    expect(updatedWorld.money).toBe(1000);
    expect(updatedWorld.happiness).toBe(50);
    expect(updatedWorld.population).toBe(100);
    expect(updatedWorld.pollution).toBe(20);
  });



});
