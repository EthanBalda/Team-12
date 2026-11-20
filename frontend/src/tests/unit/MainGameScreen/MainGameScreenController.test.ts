
import { beforeEach, describe, it, expect, vi, afterEach } from "vitest";
import Konva from "konva";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import type { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";

afterEach(() => {
  vi.restoreAllMocks();
});

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
    updateEndYearButton = vi.fn();
    showMessage = vi.fn();

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
});
