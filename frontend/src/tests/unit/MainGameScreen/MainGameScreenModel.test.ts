import { describe, expect, it } from "vitest";
import {
  MainGameScreenModel,
  type BuildingType,
} from "../../../screens/MainGameScreen/MainGameScreenModel";

describe("MainGameScreenModel", () => {
  it("assigns the correct health to each building type", () => {
    const model = new MainGameScreenModel();

    model.build("park", "north");
    model.build("housing", "south");
    model.build("factory", "east");
    model.build("renewable", "west");

    expect(model.getBuildings()).toEqual([
      {
        id: "building-1",
        type: "park",
        district: "north",
        health: 25,
        maxHealth: 25,
      },
      {
        id: "building-2",
        type: "housing",
        district: "south",
        health: 50,
        maxHealth: 50,
      },
      {
        id: "building-3",
        type: "factory",
        district: "east",
        health: 75,
        maxHealth: 75,
      },
      {
        id: "building-4",
        type: "renewable",
        district: "west",
        health: 100,
        maxHealth: 100,
      },
    ]);

    expect(model.getStats()).toEqual({
      money: 210000,
      population: 10500,
      pollution: 30,
      year: 1,
    });
  });

  it("keeps existing build calls compatible by defaulting to north", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    expect(model.getBuildings()[0]!.district).toBe("north");
  });

  it("rejects unaffordable buildings without changing state", () => {
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

  it("returns isolated building snapshots", () => {
    const model = new MainGameScreenModel();
    model.build("park");

    const buildings = model.getBuildings();
    buildings[0]!.health = 0;
    buildings[0]!.district = "south";
    buildings.pop();

    expect(model.getBuildings()[0]).toMatchObject({
      health: 25,
      district: "north",
    });
  });

  it("damages only buildings in the affected district", () => {
    const model = new MainGameScreenModel();
    model.build("housing", "north");
    model.build("factory", "south");

    const result = model.applyWeatherDamage(20, "north");

    expect(result.populationLost).toBe(0);
    expect(result.destroyedBuildings).toEqual([]);
    expect(result.affectedBuildings).toHaveLength(1);

    expect(model.getBuildings().map((building) => building.health))
      .toEqual([30, 75]);

    expect(model.getStats().population).toBe(10500);
  });

  it("preserves damage between separate weather events", () => {
    const model = new MainGameScreenModel();
    model.build("housing", "north");

    model.applyWeatherDamage(20, "north");
    expect(model.getBuildings()[0]!.health).toBe(30);

    const result = model.applyWeatherDamage(30, "north");

    expect(result.populationLost).toBe(500);
    expect(result.destroyedBuildings[0]!.health).toBe(0);
    expect(model.getBuildings()).toEqual([]);
    expect(model.getStats().population).toBe(10000);
  });

  const destructionCases: [BuildingType, number, number][] = [
    ["park", 25, 50],
    ["housing", 50, 500],
    ["factory", 75, 100],
    ["renewable", 100, 150],
  ];

  it.each(destructionCases)(
    "destroying %s at %s damage removes %s residents",
    (type, damage, expectedLoss) => {
      const model = new MainGameScreenModel();
      model.build(type, "east");
      const populationBefore = model.getStats().population;

      const result = model.applyWeatherDamage(damage, "east");

      expect(result.populationLost).toBe(expectedLoss);
      expect(result.destroyedBuildings).toHaveLength(1);
      expect(model.getBuildings()).toEqual([]);
      expect(model.getStats().population)
        .toBe(populationBefore - expectedLoss);
    },
  );

  it("combines population losses from multiple destroyed buildings", () => {
    const model = new MainGameScreenModel();

    model.build("park", "north");
    model.build("housing", "north");
    model.build("factory", "north");
    model.build("renewable", "north");

    const result = model.applyWeatherDamage(100, "north");

    expect(result.populationLost).toBe(800);
    expect(result.destroyedBuildings).toHaveLength(4);
    expect(model.getStats().population).toBe(9700);
    expect(model.getStats().money).toBe(210000);
    expect(model.getBuildings()).toEqual([]);
  });

  it("does not remove residents again for already destroyed buildings", () => {
    const model = new MainGameScreenModel();
    model.build("park", "north");

    model.applyWeatherDamage(25, "north");
    const result = model.applyWeatherDamage(25, "north");

    expect(result.populationLost).toBe(0);
    expect(result.destroyedBuildings).toEqual([]);
    expect(model.getStats().population).toBe(9950);
  });

  it("does nothing when damage is zero or the district is empty", () => {
    const model = new MainGameScreenModel();
    model.build("housing", "north");

    const statsBefore = model.getStats();
    const buildingsBefore = model.getBuildings();

    model.applyWeatherDamage(0, "north");
    model.applyWeatherDamage(100, "south");

    expect(model.getStats()).toEqual(statsBefore);
    expect(model.getBuildings()).toEqual(buildingsBefore);
  });

  it.each([-1, 1.5, NaN, Infinity])(
    "rejects invalid damage %s without changing state",
    (damage) => {
      const model = new MainGameScreenModel();
      model.build("park");

      const statsBefore = model.getStats();
      const buildingsBefore = model.getBuildings();

      expect(() => model.applyWeatherDamage(damage, "north"))
        .toThrow("Damage");

      expect(model.getStats()).toEqual(statsBefore);
      expect(model.getBuildings()).toEqual(buildingsBefore);
    },
  );

  it("does not reuse destroyed building IDs", () => {
    const model = new MainGameScreenModel();

    model.build("park", "north");
    model.applyWeatherDamage(25, "north");
    model.build("factory", "south");

    expect(model.getBuildings()[0]!.id).toBe("building-2");
  });

  it("allows spending the exact remaining budget", () => {
    const model = new MainGameScreenModel();

    expect(model.spendMoney(500000)).toBe(true);
    expect(model.getStats().money).toBe(0);
  });

  it.each([-1, 1.5, NaN, Infinity, 500001])(
    "rejects invalid or unaffordable spending of %s",
    (amount) => {
      const model = new MainGameScreenModel();

      expect(model.spendMoney(amount)).toBe(false);
      expect(model.getStats().money).toBe(500000);
    },
  );

  it("preserves year advancement without repairing buildings", () => {
    const model = new MainGameScreenModel();
    model.build("factory", "north");
    model.applyWeatherDamage(20, "north");

    model.endYear();

    expect(model.getStats()).toEqual({
      money: 460400,
      population: 10200,
      pollution: 37,
      year: 2,
    });

    expect(model.getBuildings()[0]!.health).toBe(55);
  });
});