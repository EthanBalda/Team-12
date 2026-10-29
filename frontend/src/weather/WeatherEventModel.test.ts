import { describe, expect, it } from "vitest";
import { floodEvent } from "./WeatherEvent";
import { WeatherEventModel } from "./WeatherEventModel";

describe("WeatherEventModel", () => {
  it("uses moderate damage below the high-pollution threshold", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 250,
      pollution: 69,
    });

    expect(model.getSeverity()).toBe("Moderate");
    expect(model.getUnprotectedDamage()).toBe(40);
    expect(model.getCause()).toBe(floodEvent.causedBy.lowPollution);
  });

  it("increases damage at the high-pollution threshold", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 250,
      pollution: 70,
    });

    expect(model.getSeverity()).toBe("Severe");
    expect(model.getUnprotectedDamage()).toBe(60);
    expect(model.getCause()).toBe(floodEvent.causedBy.highPollution);
  });

  it("deducts the purchase cost and reduces expected damage", () => {
    const city = { money: 250, pollution: 80 };
    const model = new WeatherEventModel(floodEvent, city);

    expect(model.purchasePreparation("sandbags")).toEqual({
      success: true,
    });

    expect(city.money).toBe(150);
    expect(model.getBudget()).toBe(150);
    expect(model.hasPurchased("sandbags")).toBe(true);
    expect(model.getProtection()).toBe(10);
    expect(model.getExpectedDamage()).toBe(50);
  });

  it("allows a purchase with exactly enough money", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 100,
      pollution: 20,
    });

    expect(model.purchasePreparation("sandbags")).toEqual({
      success: true,
    });

    expect(model.getBudget()).toBe(0);
    expect(model.getExpectedDamage()).toBe(30);
  });

  it("rejects an unaffordable purchase without changing state", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 99,
      pollution: 20,
    });

    expect(model.purchasePreparation("sandbags")).toEqual({
      success: false,
      reason: "insufficient-funds",
    });

    expect(model.getBudget()).toBe(99);
    expect(model.getProtection()).toBe(0);
    expect(model.hasPurchased("sandbags")).toBe(false);
    expect(model.getExpectedDamage()).toBe(40);
  });

  it("rejects duplicate purchases without charging again", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 300,
      pollution: 20,
    });

    model.purchasePreparation("sandbags");

    expect(model.purchasePreparation("sandbags")).toEqual({
      success: false,
      reason: "already-purchased",
    });

    expect(model.getBudget()).toBe(200);
    expect(model.getProtection()).toBe(10);
  });

  it("combines protection from different preparations", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 300,
      pollution: 80,
    });

    model.purchasePreparation("sandbags");
    model.purchasePreparation("drainage");

    expect(model.getBudget()).toBe(0);
    expect(model.getProtection()).toBe(30);
    expect(model.getExpectedDamage()).toBe(30);
  });

  it("checks the remaining budget after an earlier purchase", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 250,
      pollution: 80,
    });

    model.purchasePreparation("sandbags");

    expect(model.purchasePreparation("drainage")).toEqual({
      success: false,
      reason: "insufficient-funds",
    });

    expect(model.getBudget()).toBe(150);
    expect(model.getProtection()).toBe(10);
  });

  it("rejects an unknown preparation without changing state", () => {
    const model = new WeatherEventModel(floodEvent, {
      money: 250,
      pollution: 20,
    });

    expect(model.purchasePreparation("unknown")).toEqual({
      success: false,
      reason: "unknown-preparation",
    });

    expect(model.getBudget()).toBe(250);
    expect(model.getProtection()).toBe(0);
  });

  it("never produces negative damage", () => {
    const mildFlood = { ...floodEvent, baseDamage: 5 };
    const model = new WeatherEventModel(mildFlood, {
      money: 100,
      pollution: 20,
    });

    model.purchasePreparation("sandbags");

    expect(model.getExpectedDamage()).toBe(0);
  });

  it("starts each event with no purchased preparations", () => {
    const city = { money: 300, pollution: 20 };
    const firstEvent = new WeatherEventModel(floodEvent, city);

    firstEvent.purchasePreparation("sandbags");

    const nextEvent = new WeatherEventModel(floodEvent, city);

    expect(nextEvent.getBudget()).toBe(200);
    expect(nextEvent.hasPurchased("sandbags")).toBe(false);
    expect(nextEvent.getProtection()).toBe(0);
  });
});