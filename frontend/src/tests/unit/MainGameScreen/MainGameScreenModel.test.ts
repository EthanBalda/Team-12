import { describe, expect, it } from "vitest";
import {
  MainGameScreenModel,
} from "../../../screens/MainGameScreen/MainGameScreenModel";

import type { Build } from "../../../screens/CompareScreen/CompareScreenModel";
import buildingsData from "../../../screens/CompareScreen/buildOptions.json";

const getBuild = (name: string): Build => {
  const found = (buildingsData as Build[]).find((b) => b.name === name);
  if (!found) throw new Error(`Unknown build: ${name}`);
  return found;
};

describe("MainGameScreenModel", () => {
  it("assigns the correct health to current building tier", () => {
    const model = new MainGameScreenModel();

    model.build(getBuild("Park"), "north");

    expect(model.getStats()).toEqual({
      money: 490000,
      population: 10000,
      pollution: 22,
      year: 1,
    });
  });

  it("keeps existing build calls compatible by defaulting to north", () => {
    const model = new MainGameScreenModel();
    model.build(getBuild("Park"));

    expect(model.getBuildings()[0]!.district).toBe("north");
  });

  it("rejects unaffordable buildings without changing state", () => {
    const model = new MainGameScreenModel();

    for (let index = 0; index < 10; index++) {
      expect(model.build(getBuild("Refinery"))).toBe(true);
    }

    const statsBefore = model.getStats();
    const buildingsBefore = model.getBuildings();

    expect(model.build(getBuild("Refinery"))).toBe(false);
    expect(model.getStats()).toEqual(statsBefore);
    expect(model.getBuildings()).toEqual(buildingsBefore);
  });

  it("returns isolated building snapshots", () => {
    const model = new MainGameScreenModel();
    model.build(getBuild("Refinery"))

    const buildings = model.getBuildings();
    buildings[0]!.health = 0;
    buildings[0]!.district = "south";
    buildings.pop();

    expect(model.getBuildings()[0]).toMatchObject({
      health: 50,
      district: "north",
    });
  });

  it("damages only buildings in the affected district", () => {
    const model = new MainGameScreenModel();
    model.build(getBuild("Park"), "north");
    model.build(getBuild("Park"), "south");

    const result = model.applyWeatherDamage(20, "north");

    expect(result.populationLost).toBe(0);
    expect(result.destroyedBuildings).toEqual([]);
    expect(result.affectedBuildings).toHaveLength(1);


    expect(model.getStats().population).toBe(10000);
  });

  it("preserves damage between separate weather events", () => {
    const model = new MainGameScreenModel();
    model.build(getBuild("Park"), "north");

    model.applyWeatherDamage(20, "north");
    expect(model.getBuildings()[0]!.health).toBe(30);

    const result = model.applyWeatherDamage(30, "north");
    expect(result.destroyedBuildings[0]!.health).toBe(0);
    expect(model.getBuildings()).toEqual([]);
    expect(model.getStats().population).toBe(10015);
  });
});

// Tests for Issue #6: Advancing the year and updating city statistics.
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