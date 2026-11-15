
import { describe, it, expect, vi } from "vitest";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import type { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";

// Mock the view so we can test the controller without rendering the game.
vi.mock("../../../screens/MainGameScreen/MainGameScreenView", () => ({
  // Use a class because the controller creates the view with "new".
  MainGameScreenView: class {
    clickEndYear: () => Promise<void>;

    updateStats = vi.fn();
    updateYear = vi.fn();
    updateBuildings = vi.fn();
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
});
