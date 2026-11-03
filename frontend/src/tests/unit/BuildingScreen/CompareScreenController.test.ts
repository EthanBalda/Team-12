import Konva from "konva";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareScreenController } from "../../../screens/BuildingScreen/CompareScreenController";
import type { Build } from "../../../screens/BuildingScreen/CompareScreenModel";
import type { ScreenSwitcher } from "../../../types";

function makeSwitcher(): ScreenSwitcher {
  return { switchToScreen: vi.fn() } as unknown as ScreenSwitcher;
}

function texts(controller: compareScreenController): string[] {
  return controller
    .getView()
    .getGroup()
    .find("Text")
    .map((node) => (node as Konva.Text).text());
}

function clickSelect(controller: compareScreenController, index: 0 | 1): void {
  controller
    .getView()
    .getGroup()
    .find("Text")
    .filter((node) => (node as Konva.Text).text() === "Select")
    [index]!.getParent()!
    .fire("click");
}

// Reaches into the controller's private model for assertions
function modelOf(controller: compareScreenController) {
  return (controller as any).model as {
    getCurrentTier(): number;
    getLeftBuild(): Build | null;
    getRightBuild(): Build | null;
  };
}

describe("compareScreenController", () => {
  let onBuildSelected: ReturnType<typeof vi.fn>;
  let controller: compareScreenController;

  beforeEach(() => {
    onBuildSelected = vi.fn();
    controller = new compareScreenController(makeSwitcher(), onBuildSelected);
  });

  describe("construction", () => {
    it("exposes a view", () => {
      expect(controller.getView()).toBeDefined();
      expect(controller.getView().getGroup()).toBeInstanceOf(Konva.Group);
    });

    it("starts on tier 1 with no builds picked", () => {
      expect(modelOf(controller).getCurrentTier()).toBe(1);
      expect(modelOf(controller).getLeftBuild()).toBeNull();
      expect(modelOf(controller).getRightBuild()).toBeNull();
    });
  });

  describe("show", () => {
    it("picks a tier 1 pair and renders it", () => {
      controller.show();

      const model = modelOf(controller);
      const left = model.getLeftBuild()!;
      const right = model.getRightBuild()!;

      expect(left.tier).toBe(1);
      expect(right.tier).toBe(1);
      expect(left.name).not.toBe(right.name);
      expect(texts(controller)).toContain(left.name);
      expect(texts(controller)).toContain(right.name);
    });

    it("calls the view's updateBuilds with the model's builds", () => {
      const spy = vi.spyOn(controller.getView(), "updateBuilds");

      controller.show();

      const model = modelOf(controller);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        model.getLeftBuild(),
        model.getRightBuild(),
      );
    });

    it("picks a fresh pair each time it is shown", () => {
      const seen = new Set<string>();

      for (let i = 0; i < 50; i++) {
        controller.show();
        const model = modelOf(controller);
        seen.add(`${model.getLeftBuild()!.name}|${model.getRightBuild()!.name}`);
      }

      expect(seen.size).toBeGreaterThan(1);
    });
  });

  describe("selecting a building", () => {
    it("reports the left build to the callback", () => {
      controller.show();
      const left = modelOf(controller).getLeftBuild();

      clickSelect(controller, 0);

      expect(onBuildSelected).toHaveBeenCalledTimes(1);
      expect(onBuildSelected).toHaveBeenCalledWith(left);
    });

    it("reports the right build to the callback", () => {
      controller.show();
      const right = modelOf(controller).getRightBuild();

      clickSelect(controller, 1);

      expect(onBuildSelected).toHaveBeenCalledTimes(1);
      expect(onBuildSelected).toHaveBeenCalledWith(right);
    });

    it("advances to the next tier after a selection", () => {
      controller.show();

      clickSelect(controller, 0);

      expect(modelOf(controller).getCurrentTier()).toBe(2);
    });

    it("shows a new pair from the next tier after a selection", () => {
      controller.show();

      clickSelect(controller, 0);

      const model = modelOf(controller);
      expect(model.getLeftBuild()!.tier).toBe(2);
      expect(model.getRightBuild()!.tier).toBe(2);
      expect(texts(controller)).toContain(model.getLeftBuild()!.name);
      expect(texts(controller)).toContain(model.getRightBuild()!.name);
    });

    it("passes the pre-advance build (old tier) to the callback", () => {
      controller.show();

      clickSelect(controller, 0);

      const selected = onBuildSelected.mock.calls[0]![0] as Build;
      expect(selected.tier).toBe(1);
    });

    it("displays the 'Previously Selected' message for the chosen build", () => {
      controller.show();
      const right = modelOf(controller).getRightBuild()!;

      clickSelect(controller, 1);

      expect(texts(controller)).toContain(`Previously Selected: ${right.name}`);
    });

    it("keeps the selection message while the next pair is displayed", () => {
      controller.show();
      clickSelect(controller, 0);

      const message = texts(controller).filter((t) =>
        t.startsWith("Previously Selected"),
      );
      expect(message).toHaveLength(1);
    });

    it("walks through every tier and stays on the last one", () => {
      controller.show();

      clickSelect(controller, 0); // tier 1 -> 2
      expect(modelOf(controller).getCurrentTier()).toBe(2);

      clickSelect(controller, 1); // tier 2 -> 3
      expect(modelOf(controller).getCurrentTier()).toBe(3);

      clickSelect(controller, 0); // already at max
      expect(modelOf(controller).getCurrentTier()).toBe(3);
      expect(modelOf(controller).getLeftBuild()!.tier).toBe(3);
      expect(onBuildSelected).toHaveBeenCalledTimes(3);
    });

    it("works without an onBuildSelected callback", () => {
      const noCallback = new compareScreenController(makeSwitcher());
      noCallback.show();

      expect(() => clickSelect(noCallback, 0)).not.toThrow();
      expect(modelOf(noCallback).getCurrentTier()).toBe(2);
    });

    it("ignores clicks when no build has been loaded yet", () => {
      // show() has not been called, so both builds are null
      clickSelect(controller, 0);
      clickSelect(controller, 1);

      expect(onBuildSelected).not.toHaveBeenCalled();
      expect(modelOf(controller).getCurrentTier()).toBe(1);
    });
  });
});
