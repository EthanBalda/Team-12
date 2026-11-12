import { describe, expect, it } from "vitest";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";
import { floodEvent } from "../../../Weather/WeatherEvent";
import { CityWeatherEvent } from "../../../Weather/CityWeatherEvent";
import type { Build } from "../../../screens/CompareScreen/CompareScreenModel";
import buildingsData from "../../../screens/CompareScreen/buildOptions.json";

const getBuild = (name: string): Build => {
  const found = (buildingsData as Build[]).find((b) => b.name === name);
  if (!found) throw new Error(`Unknown build: ${name}`);
  return found;
};

describe("CityWeatherEvent", () => {
  it("deducts preparation costs from the actual city budget", () => {
    const city = new MainGameScreenModel();
    const event = new CityWeatherEvent(floodEvent, city, "north");

    expect(event.purchasePreparation("sandbags")).toEqual({
      success: true,
    });

    expect(city.getStats().money).toBe(499900);
    expect(event.getState().budget).toBe(499900);
    expect(event.getState().expectedDamage).toBe(30);
  });

  it("checks the current city budget before purchases", () => {
    const city = new MainGameScreenModel();
    const event = new CityWeatherEvent(floodEvent, city, "north");

    city.spendMoney(499950);

    expect(event.purchasePreparation("sandbags")).toEqual({
      success: false,
      reason: "insufficient-funds",
    });

    expect(city.getStats().money).toBe(50);
    expect(event.getState().protection).toBe(0);
  });

  it("does not charge for duplicate or unknown preparations", () => {
    const city = new MainGameScreenModel();
    const event = new CityWeatherEvent(floodEvent, city, "north");

    event.purchasePreparation("sandbags");

    expect(event.purchasePreparation("sandbags")).toEqual({
      success: false,
      reason: "already-purchased",
    });

    expect(event.purchasePreparation("missing")).toEqual({
      success: false,
      reason: "unknown-preparation",
    });

    expect(city.getStats().money).toBe(499900);
  });

  it("damages the targeted district and derives population loss from destruction", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Park"), "north");
    city.build(getBuild("Factory"), "north");
    city.build(getBuild("Factory"), "south");

    const event = new CityWeatherEvent(floodEvent, city, "north");
    expect(event.resolve()).toEqual({
      district: "north",
      destroyedBuildingIds: ["building-1"],
    });

    
    expect(city.getStats().population).toBe(10450);

    expect(city.getBuildings()).toEqual([
      {
        id: "building-2",
        type: "housing",
        district: "north",
        health: 10,
        maxHealth: 50,
      },
      {
        id: "building-3",
        type: "factory",
        district: "south",
        health: 75,
        maxHealth: 75,
      },
    ]);
  });

  it("lets preparations protect buildings and avoid population loss", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Park"), "north");

    const event = new CityWeatherEvent(floodEvent, city, "north");
    event.purchasePreparation("sandbags");
    event.purchasePreparation("drainage");

    expect(event.resolve()).toEqual({
      district: "north",
      damage: 10,
      populationLost: 0,
      destroyedBuildingIds: [],
    });

  });

  it("uses severe damage when city pollution is high", () => {
    const city = new MainGameScreenModel();

    for (let index = 0; index < 5; index++) {
      city.build(getBuild("Factory"), "north");
    }

    const event = new CityWeatherEvent(floodEvent, city, "north");

    expect(event.getState().severity).toBe("Severe");
    expect(event.resolve().damage).toBe(60);
    expect(city.getBuildings().every((building) => building.health === 15))
      .toBe(true);

    // Damaged factories are still standing, so no residents are lost.
    expect(city.getStats().population).toBe(10000);
  });

  it("preserves building damage across separate floods", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Factory"), "north");

    const firstEvent = new CityWeatherEvent(floodEvent, city, "north");
    expect(firstEvent.resolve().populationLost).toBe(0);
    expect(city.getBuildings()[0]!.health).toBe(10);

    const secondEvent = new CityWeatherEvent(floodEvent, city, "north");
    expect(secondEvent.resolve().populationLost).toBe(500);
    expect(city.getBuildings()).toEqual([]);
    expect(city.getStats().population).toBe(10000);
  });

  it("applies each event only once", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Factory"), "north");

    const event = new CityWeatherEvent(floodEvent, city, "north");
    const result = event.resolve();

    expect(event.resolve()).toBe(result);
  });

  it("rejects purchases after resolution", () => {
    const city = new MainGameScreenModel();
    const event = new CityWeatherEvent(floodEvent, city, "north");

    event.resolve();
    const moneyBefore = city.getStats().money;

    expect(event.purchasePreparation("sandbags")).toEqual({
      success: false,
      reason: "event-resolved",
    });

    expect(city.getStats().money).toBe(moneyBefore);
    expect(event.getState().resolved).toBe(true);
  });

  it("causes no population loss when the affected district is empty", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Park"), "south");

    const event = new CityWeatherEvent(floodEvent, city, "north");

    expect(event.resolve().populationLost).toBe(0);
    expect(city.getBuildings()[0]!.health).toBe(50);
    expect(city.getStats().population).toBe(10000);
  });
});