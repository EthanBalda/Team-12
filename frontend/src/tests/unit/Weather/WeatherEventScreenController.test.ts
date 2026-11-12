import Konva from "konva";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";
import { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import { WeatherEventScreenController } from "../../../screens/WeatherEventScreen/WeatherEventScreenController";
import { WeatherEventScreenView } from "../../../screens/WeatherEventScreen/WeatherEventScreenView";
import { floodEvent } from "../../../Weather/WeatherEvent";
import type { Build } from "../../../screens/CompareScreen/CompareScreenModel";
import buildingsData from "../../../screens/CompareScreen/buildOptions.json";

const getBuild = (name: string): Build => {
  const found = (buildingsData as Build[]).find((b) => b.name === name);
  if (!found) throw new Error(`Unknown build: ${name}`);
  return found;
};
// Overlay rectangles need no canvas rendering in these controller tests.
vi.mock("konva", async (importOriginal) => {
  const { default: actual } = await importOriginal<typeof import("konva")>();
  return { default: { ...actual, Rect: actual.Group } };
});

vi.mock("../../../screens/WeatherEventScreen/WeatherEventScreenView", () => ({
  WeatherEventScreenView: vi.fn(function () {
    const group = new Konva.Group();
    return {
      getGroup: () => group,
      update: vi.fn(),
      showMessage: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
    };
  }),
}));

vi.mock("../../../screens/MainGameScreen/MainGameScreenView", () => ({
  MainGameScreenView: vi.fn(function () {
    const group = new Konva.Group();
    return {
      getGroup: () => group,
      updateStats: vi.fn(),
      updateYear: vi.fn(),
      updateBuildings: vi.fn(),
      showMessage: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
    };
  }),
}));

beforeEach(() => vi.clearAllMocks());

describe("weather controller integration", () => {
  it("charges the city and refreshes the displayed preparation state", () => {
    const city = new MainGameScreenModel();
    const controller = new WeatherEventScreenController(floodEvent, city, "north", vi.fn());
    const purchase = vi.mocked(WeatherEventScreenView).mock.calls[0]![3];
    const initialBudget = city.getStats().money;

    purchase("sandbags");

    expect(city.getStats().money).toBe(initialBudget - 100);
    expect(controller.getView().update).toHaveBeenLastCalledWith(expect.objectContaining({
      budget: city.getStats().money,
      protection: 10,
      expectedDamage: 30,
      purchasedPreparationIds: ["sandbags"],
    }));
  });

  it("applies damage once even when continue is clicked repeatedly", () => {
    const city = new MainGameScreenModel();
    city.build(getBuild("Factory"), "north");
    const damage = vi.spyOn(city, "applyWeatherDamage");
    const controller = new WeatherEventScreenController(floodEvent, city, "north", vi.fn());
    const next = vi.mocked(WeatherEventScreenView).mock.calls[0]![4];

    next();
    expect(city.getBuildings()[0]!.health).toBe(10);
    expect(controller.getView().update).toHaveBeenLastCalledWith(expect.objectContaining({
      resolved: true,
      expectedDamage: 40,
    }));
    next();
    next();
    expect(damage).toHaveBeenCalledExactlyOnceWith(40, "north");
    expect(city.getBuildings()[0]!.health).toBe(10);
  });

  it("completes only on return and invokes completion exactly once", () => {
    const complete = vi.fn();
    new WeatherEventScreenController(floodEvent, new MainGameScreenModel(), "east", complete);
    const next = vi.mocked(WeatherEventScreenView).mock.calls[0]![4];

    next();
    expect(complete).not.toHaveBeenCalled();
    next();
    next();
    expect(complete).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      district: "east",
      damage: 40,
    }));
  });
});
