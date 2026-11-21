
import { beforeEach, describe, it, expect, vi } from "vitest";
import Konva from "konva";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import type { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";

// Mock the view so we can test the controller without rendering the game.
vi.mock("../../../screens/MainGameScreen/MainGameScreenView", () => ({
  // Use a class because the controller creates the view with "new".
  MainGameScreenView: class {
    clickEndYear: () => Promise<void>;

    getGroup = () => this.group;
    private group = new Konva.Group();

    updateStats = vi.fn();
    updateYear = vi.fn();
    updateBuildings = vi.fn();
    showMessage = vi.fn();
    show = vi.fn();

    constructor(
      _onBuild: unknown,
      onEndYear: () => Promise<void>,
      _onMinigame: unknown
    ) {
      // Save the callback so our test can simulate the button click.
      this.clickEndYear = onEndYear;
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
});
