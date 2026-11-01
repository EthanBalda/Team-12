import { describe, expect, it } from "vitest";
import { MainGameScreenModel } from "./MainGameScreenModel";

describe("MainGameScreenModel", () => {
  it("tracks purchased buildings and preserves their effects", () => {
    const model = new MainGameScreenModel();

    expect(model.build("park")).toBe(true);
    expect(model.build("housing")).toBe(true);
    expect(model.build("factory")).toBe(true);

    expect(model.getBuildings()).toEqual([
      { id: "building-1", type: "park" },
      { id: "building-2", type: "housing" },
      { id: "building-3", type: "factory" },
    ]);

    expect(model.getStats()).toEqual({
      money: 310000,
      population: 10500,
      pollution: 30,
      year: 1,
    });
  });

  it("rejects unaffordable buildings without changing city state", () => {
    const model = new MainGameScreenModel();

    for (let index = 0; index < 6; index++) {
      expect(model.build("housing")).toBe(true);
    }

    const statsBefore = model.getStats();
    const buildingsBefore = model.getBuildings();

    expect(model.build("housing")).toBe(false);
    expect(model.getStats()).toEqual(statsBefore);
    expect(model.getBuildings()).toEqual(buildingsBefore);
  });

  it("prevents callers from modifying the building inventory", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    const buildings = model.getBuildings();
    buildings[0]!.type = "factory";
    buildings.pop();

    expect(model.getBuildings()).toEqual([
      { id: "building-1", type: "park" },
    ]);
  });

  it("reduces population and destroys only the selected buildings", () => {
    const model = new MainGameScreenModel();
    model.build("park");
    model.build("housing");
    model.build("factory");

    const result = model.applyWeatherDamage(60, ["building-2"]);

    expect(result).toEqual({
      populationLost: 60,
      destroyedBuildings: [
        { id: "building-2", type: "housing" },
      ],
    });

    expect(model.getStats()).toEqual({
      money: 310000,
      population: 10440,
      pollution: 30,
      year: 1,
    });

    expect(model.getBuildings()).toEqual([
      { id: "building-1", type: "park" },
      { id: "building-3", type: "factory" },
    ]);
  });

  it("does not reduce population below zero", () => {
    const model = new MainGameScreenModel();

    expect(model.applyWeatherDamage(20000, [])).toEqual({
      populationLost: 10000,
      destroyedBuildings: [],
    });

    expect(model.getStats().population).toBe(0);
  });

  it("allows weather damage when the city has no buildings", () => {
    const model = new MainGameScreenModel();

    expect(model.applyWeatherDamage(40, [])).toEqual({
      populationLost: 40,
      destroyedBuildings: [],
    });

    expect(model.getStats().population).toBe(9960);
  });

  it("leaves the city unchanged when no damage occurs", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    const statsBefore = model.getStats();
    const buildingsBefore = model.getBuildings();

    expect(model.applyWeatherDamage(0, [])).toEqual({
      populationLost: 0,
      destroyedBuildings: [],
    });

    expect(model.getStats()).toEqual(statsBefore);
    expect(model.getBuildings()).toEqual(buildingsBefore);
  });

  it("rejects unknown building IDs before applying any damage", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    const statsBefore = model.getStats();
    const buildingsBefore = model.getBuildings();

    expect(() =>
      model.applyWeatherDamage(60, ["building-1", "missing"]),
    ).toThrow("Building not found");

    expect(model.getStats()).toEqual(statsBefore);
    expect(model.getBuildings()).toEqual(buildingsBefore);
  });

  it("counts a duplicated building ID only once", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    const result = model.applyWeatherDamage(
      40,
      ["building-1", "building-1"],
    );

    expect(result.destroyedBuildings).toHaveLength(1);
    expect(model.getBuildings()).toEqual([]);
  });

  it.each([-1, 1.5, NaN, Infinity])(
    "rejects invalid population loss %s without changing state",
    (populationLoss) => {
      const model = new MainGameScreenModel();
      const statsBefore = model.getStats();

      expect(() =>
        model.applyWeatherDamage(populationLoss, []),
      ).toThrow("Population loss");

      expect(model.getStats()).toEqual(statsBefore);
    },
  );

  it("does not reuse the ID of a destroyed building", () => {
    const model = new MainGameScreenModel();

    model.build("park");
    model.applyWeatherDamage(0, ["building-1"]);
    model.build("factory");

    expect(model.getBuildings()).toEqual([
      { id: "building-2", type: "factory" },
    ]);
  });

  it("preserves the existing year advancement behavior", () => {
    const model = new MainGameScreenModel();

    model.endYear();

    expect(model.getStats()).toEqual({
      money: 520400,
      population: 10200,
      pollution: 27,
      year: 2,
    });
  });
});