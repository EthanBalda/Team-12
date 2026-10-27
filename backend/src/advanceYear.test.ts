
import { describe, it, expect } from "vitest";
import { advanceYear } from "./advanceYear.js";
import type { CityState } from "./cityState.js";

// Group together tests for the advanceYear function.
describe("advanceYear", () => {

  // ---------- TEST ! ----------
  // Test that advancing the year increases it by exactly one.
  it("should increase the year by 1", () => {

    // Create a sample city to use for testing.
    const city: CityState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Call the function to advance the city's year.
    const updatedCity = advanceYear(city);

    // Check that the new year is 2.
    expect(updatedCity.year).toBe(2);
  });


  // ---------- TEST 2 ----------
  // Test that the game rejects invalid year values.
  it("should throw an error for an invalid year", () => {

    // Create a sample city with an invalid starting year.
    const city: CityState = {
      year: -1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Check that advanceYear throws an error instead of advancing.
    expect(() => advanceYear(city)).toThrow("Invalid city year");
  });

  
  // ---------- TEST 3 ----------
  // Test that advancing the year doesn't accidentally change city statistics.
  it("should preserve city statistics when advancing the year", () => {

    // Create a sample city with starting values for each statistic.
    const city: CityState = {
      year: 1,
      money: 1000,
      happiness: 50,
      population: 100,
      pollution: 20,
    };

    // Advance the city by one year.
    const updatedCity = advanceYear(city);

    // Make sure the statistics remain unchanged for now.
    // Building effects will be added later when that system is ready.
    expect(updatedCity.money).toBe(1000);
    expect(updatedCity.happiness).toBe(50);
    expect(updatedCity.population).toBe(100);
    expect(updatedCity.pollution).toBe(20);
  });



});
