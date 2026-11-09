import Konva from "konva";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";
import { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import { WeatherEventScreenController } from "../../../screens/WeatherEventScreen/WeatherEventScreenController";
import { WeatherEventScreenView } from "../../../screens/WeatherEventScreen/WeatherEventScreenView";
import { floodEvent } from "../../../Weather/WeatherEvent";

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
    city.build("housing", "north");
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

  it("returns to the same city and preserves minigame navigation and rewards", () => {
    const switcher = { switchToScreen: vi.fn() };
    const controller = new MainGameScreenController(switcher);
    controller.startGame();
    const view = controller.getView();
    const [build, endYear, minigame] = vi.mocked(MainGameScreenView).mock.calls[0]!;
    build("housing", "north");
    build("factory", "south");
    endYear();
    const [,,, purchase, next] = vi.mocked(WeatherEventScreenView).mock.calls[0]!;
    purchase("sandbags");
    const weatherView = vi.mocked(WeatherEventScreenView).mock.results[0]!.value as WeatherEventScreenView;
    const budget = vi.mocked(weatherView.update).mock.lastCall![0].budget;

    // Calls arriving behind the overlay must not change or leave the city.
    build("park", "east");
    endYear();
    minigame();
    controller.endGame();
    controller.applyMiniGameResult({ delta: { money: 999 }, summary: "blocked" });
    expect(switcher.switchToScreen).not.toHaveBeenCalled();
    next();
    next();
    next();

    expect(view.updateStats).toHaveBeenLastCalledWith(expect.objectContaining({ year: 2, money: budget }));
    const buildings = vi.mocked(view.updateBuildings).mock.lastCall![0];
    expect(buildings).toEqual([
      { id: "building-1", type: "housing", district: "north", health: 20, maxHealth: 50 },
      { id: "building-2", type: "factory", district: "south", health: 75, maxHealth: 75 },
    ]);
    expect(view.updateYear).toHaveBeenLastCalledWith(2);
    expect(WeatherEventScreenView).toHaveBeenCalledTimes(1);
    expect(view.showMessage).toHaveBeenCalledTimes(2);

    minigame();
    expect(switcher.switchToScreen).toHaveBeenCalledExactlyOnceWith({ type: "miniGame", id: "sorting" });
    controller.applyMiniGameResult({ delta: { money: 20000 }, summary: "reward" });
    controller.show(); // Incoming resumeGame navigation uses show(), not startGame().
    expect(view.updateStats).toHaveBeenLastCalledWith(expect.objectContaining({ year: 2, money: budget + 20000 }));
    expect(view.updateBuildings).toHaveBeenLastCalledWith(buildings);
    expect(view.showMessage).toHaveBeenLastCalledWith("reward");
  });
});
