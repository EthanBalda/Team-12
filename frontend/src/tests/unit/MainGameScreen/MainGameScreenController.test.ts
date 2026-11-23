
import { beforeEach, describe, it, expect, vi, afterEach } from "vitest";
import Konva from "konva";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import type { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";
import { MINIGAME_FEE } from "../../../MiniGames/registry";

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock the view so we can test the controller without rendering the game.
vi.mock("../../../screens/MainGameScreen/MainGameScreenView", () => ({
  // Use a class because the controller creates the view with "new".
  MainGameScreenView: class {
    clickEndYear: () => Promise<void>;
    clickMinigame: (id: string) => void;

    getGroup = () => this.group;
    private group = new Konva.Group();

    updateStats = vi.fn();
    updateYear = vi.fn();
    updateBuildings = vi.fn();
    updateEndYearButton = vi.fn();
    showMessage = vi.fn();
    show = vi.fn();

    constructor(
      _onBuild: unknown,
      onEndYear: () => Promise<void>,
      onMinigame: (id: string) => void
    ) {
      // Save the callback so our test can simulate the button click.
      this.clickEndYear = onEndYear;
      this.clickMinigame = onMinigame;
    }
  },
}));

describe("MainGameScreenController - End Year", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 10 }),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({ gameOver: false }),
    );
  });

  it("should display the yearly changes when End Year is clicked", async () => {
    // Create the controller with a mock screen switcher.
    const screenSwitcher = {
      switchToScreen: vi.fn(),
    };

    const controller = new MainGameScreenController(
      screenSwitcher as any
    );

    // Skip rendering the weather overlay in this unit test.
    vi.spyOn(controller as any, "openWeather").mockImplementation(() => {});

    // Get the mocked view and simulate clicking End Year.
    const view = controller.getView() as MainGameScreenView & {
      clickEndYear: () => void;
    };

    await view.clickEndYear();

    // Verify the year was updated on the screen.
    expect(view.updateYear).toHaveBeenCalledWith(2);

    // Verify that a summary of the changes was displayed.
    expect(view.showMessage).toHaveBeenCalledWith(
      expect.stringContaining("Year 2 Summary:")
    );

    expect(view.showMessage).toHaveBeenCalledWith(
      expect.stringContaining("Population +")
    );

    expect(view.showMessage).toHaveBeenCalledWith(
      expect.stringContaining("Money +")
    );

    expect(view.showMessage).toHaveBeenCalledWith(
      expect.stringContaining("Pollution +")
    );
  });

  it("saves and shows a pollution loss when End Year raises pollution from 98 to 100", async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        cityState: {
          stats: { population: 10000, money: 500000, pollution: 98, year: 1 },
        },
      }),
    );
    const screenSwitcher = { switchToScreen: vi.fn() };
    const controller = new MainGameScreenController(screenSwitcher);
    const view = controller.getView() as MainGameScreenView & {
      clickEndYear: () => Promise<void>;
    };

    await controller.loadGame();
    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith({ type: "resumeGame" });

    await view.clickEndYear();

    const finalStats = { population: 10200, money: 520400, pollution: 100, year: 2 };
    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith({
      type: "result",
      success: false,
      reason: "pollution",
      stats: finalStats,
    });
    expect(view.getGroup().getChildren()).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/worlds\/game-over$/),
      expect.anything(),
    );
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/worlds\/state$/),
        expect.objectContaining({ method: "PUT" }),
      );
    });
    const save = fetchMock.mock.calls.find(([, options]) => options?.method === "PUT");
    expect(JSON.parse(String(save?.[1]?.body))).toMatchObject({ stats: finalStats });
  });

  it("advances once while the game-over check is pending and again after the flood", async () => {
    vi.spyOn(MainGameScreenModel.prototype, "canEndYear")
    .mockReturnValue(true);

    let resolveRequest!: (response: Response) => void;
    const request = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.mocked(fetch).mockReturnValueOnce(request);
    const controller = new MainGameScreenController({ switchToScreen: vi.fn() });
    const view = controller.getView() as MainGameScreenView & {
      clickEndYear: () => Promise<void>;
    };
    const group = view.getGroup();
    const findButtons = (label: string) => group.find<Konva.Text>(
      (node: Konva.Node) => node instanceof Konva.Text && node.text() === label,
    );

    const firstClick = view.clickEndYear();
    const secondClick = view.clickEndYear();
    const requestsWhilePending = fetchMock.mock.calls.length;
    resolveRequest(Response.json({ gameOver: false }));
    await Promise.all([firstClick, secondClick]);

    expect(requestsWhilePending).toBe(1);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/\/worlds\/game-over$/),
      expect.objectContaining({ method: "POST" }),
    );
    expect(vi.mocked(view.updateYear).mock.calls).toEqual([[1], [2]]);
    const floodButtons = findButtons("Face the Flood");
    expect(floodButtons).toHaveLength(1);

    await view.clickEndYear();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    floodButtons[0]!.getParent()!.fire("click");
    findButtons("Return to City")[0]!.getParent()!.fire("click");
    expect(findButtons("Return to City")).toHaveLength(0);

    await view.clickEndYear();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(view.updateYear).toHaveBeenLastCalledWith(3);
    expect(findButtons("Face the Flood")).toHaveLength(1);
    group.destroy();
  });

  function setupVictoryTest() {
    vi.spyOn(MainGameScreenModel.prototype, "canEndYear").mockReturnValue(true);

    let forceLoss = false;

    vi.mocked(fetch).mockImplementation(async (_url, options) => {
      const { year } = JSON.parse(String(options?.body));

      if (forceLoss) {
        return Response.json({
          gameOver: true,
          success: false,
          reason: "money",
        });
      }

      return Response.json(
        year >= 10
          ? { gameOver: true, success: true }
          : { gameOver: false },
      );
    });

    const screenSwitcher = {
      switchToScreen: vi.fn((screen: { type: string }) => {
        if (screen.type === "resumeGame") {
          controller.show();
        }
        if (screen.type === "mainGame") {
          controller.startGame();
        }
      }),
    };

    const controller = new MainGameScreenController(screenSwitcher);
    vi.spyOn(
      controller as unknown as { openWeather: () => void },
      "openWeather",
    ).mockImplementation(() => {});

    const view = controller.getView() as MainGameScreenView & {
      clickEndYear: () => Promise<void>;
    };

    async function advanceToYear10() {
      // A fresh game starts at year 1.
      for (let year = 1; year < 10; year++) {
        await view.clickEndYear();
      }
    }

    return {
      view,
      screenSwitcher,
      advanceToYear10,
      setForceLoss: (value: boolean) => {
        forceLoss = value;
      },
    };
  }

  it("shows victory once and keeps advancing after Continue", async () => {
    const { view, screenSwitcher, advanceToYear10 } = setupVictoryTest();

    await advanceToYear10();
    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "result",
        success: true,
        stats: expect.objectContaining({ year: 10 }),
      }),
    );

    screenSwitcher.switchToScreen({ type: "resumeGame" });
    screenSwitcher.switchToScreen.mockClear();

    await view.clickEndYear();
    await view.clickEndYear();

    expect(view.updateYear).toHaveBeenLastCalledWith(12);
    expect(view.showMessage).toHaveBeenCalledWith(
      expect.stringContaining("Year 12 Summary:"),
    );
    expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
  });

  it("shows a loss after Continue and allows victory again after Try Again", async () => {
    const { screenSwitcher, view, advanceToYear10, setForceLoss } =
      setupVictoryTest();

    await advanceToYear10();
    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "result", success: true }),
    );

    screenSwitcher.switchToScreen({ type: "resumeGame" });
    setForceLoss(true);
    await view.clickEndYear();

    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "result", success: false }),
    );

    setForceLoss(false);
    screenSwitcher.switchToScreen({ type: "mainGame" });
    expect(view.updateYear).toHaveBeenLastCalledWith(1);

    screenSwitcher.switchToScreen.mockClear();
    await advanceToYear10();

    expect(screenSwitcher.switchToScreen).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "result",
        success: true,
        stats: expect.objectContaining({ year: 10 }),
      }),
    );
  });
});

describe("MainGameScreenController - Minigame fee", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 10 }),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    } as unknown as CanvasRenderingContext2D);
  });

  function setup() {
    const screenSwitcher = { switchToScreen: vi.fn() };
    const controller = new MainGameScreenController(screenSwitcher as any);
    const model = (controller as any).model as MainGameScreenModel;
    const view = controller.getView() as MainGameScreenView & { clickMinigame: (id: string) => void };
    return { screenSwitcher, model, view };
  }

  it("charges the fee and opens the chosen minigame", () => {
    const { screenSwitcher, model, view } = setup();
    const money = model.getStats().money;

    view.clickMinigame("sorting");

    expect(model.getStats().money).toBe(money - MINIGAME_FEE);
    expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "miniGame", id: "sorting" });
  });

  it("does not open a minigame when the player cannot pay the fee", () => {
    const { screenSwitcher, model, view } = setup();
    model.spendMoney(model.getStats().money - (MINIGAME_FEE - 1));

    view.clickMinigame("trivia");

    expect(model.getStats().money).toBe(MINIGAME_FEE - 1);
    expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    expect(view.showMessage).toHaveBeenCalledWith("Not enough money to play!");
  });
});
