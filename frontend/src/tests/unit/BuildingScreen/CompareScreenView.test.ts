import Konva from "konva";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareScreenView } from "../../../screens/BuildingScreen/CompareScreenView";
import type { Build } from "../../../screens/BuildingScreen/CompareScreenModel";
import { STAGE_WIDTH } from "../../../constants";

const park: Build = {
  name: "Park",
  money: 10,
  happiness: 50,
  pollution: -20,
  tier: 1,
};

const factory: Build = {
  name: "Factory",
  money: 40,
  happiness: 30,
  pollution: 40,
  tier: 1,
};

function texts(view: compareScreenView): string[] {
  return view
    .getGroup()
    .find("Text")
    .map((node) => (node as Konva.Text).text());
}

function selectButtons(view: compareScreenView): Konva.Node[] {
  return view
    .getGroup()
    .find("Text")
    .filter((node) => (node as Konva.Text).text() === "Select")
    .map((label) => label.getParent()!);
}

describe("compareScreenView", () => {
  let onLeft: ReturnType<typeof vi.fn>;
  let onRight: ReturnType<typeof vi.fn>;
  let view: compareScreenView;

  beforeEach(() => {
    onLeft = vi.fn();
    onRight = vi.fn();
    view = new compareScreenView(onLeft, onRight);
  });

  describe("construction", () => {
    it("is visible by default and exposes its group", () => {
      expect(view.getGroup()).toBeInstanceOf(Konva.Group);
      expect(view.getGroup().visible()).toBe(true);
    });

    it("shows the title and two Select buttons", () => {
      const all = texts(view);

      expect(all).toContain("Choose Building");
      expect(all.filter((t) => t === "Select")).toHaveLength(2);
    });

    it("starts with an empty feedback message", () => {
      const all = texts(view);

      expect(all.some((t) => t.startsWith("Previously Selected"))).toBe(false);
    });

    it("places two panels side by side, centered on the stage", () => {
      const panels = view
        .getGroup()
        .getChildren((node) => node.getClassName() === "Group");

      expect(panels).toHaveLength(2);

      const [left, right] = panels;
      const leftEdge = left!.x();
      const rightEdge = right!.x() + 500;

      expect(left!.y()).toBe(right!.y());
      expect(right!.x()).toBeGreaterThan(left!.x() + 500);
      // Equal margin on both sides => centered
      expect(leftEdge).toBeCloseTo(STAGE_WIDTH - rightEdge);
    });
  });

  describe("updateBuilds", () => {
    it("renders each building's name", () => {
      view.updateBuilds(park, factory);
      const all = texts(view);

      expect(all).toContain("Park");
      expect(all).toContain("Factory");
    });

    it("renders each building's stats", () => {
      view.updateBuilds(park, factory);
      const all = texts(view);

      expect(all).toContain(
        "Cost: 10\nHappiness: 50\nPollution: -20\nTier: 1",
      );
      expect(all).toContain(
        "Cost: 40\nHappiness: 30\nPollution: 40\nTier: 1",
      );
    });

    it("puts the left build in the left panel and the right build in the right", () => {
      view.updateBuilds(park, factory);
      const nameNodes = view
        .getGroup()
        .find("Text")
        .filter((n) => ["Park", "Factory"].includes((n as Konva.Text).text()));

      const parkNode = nameNodes.find((n) => (n as Konva.Text).text() === "Park")!;
      const factoryNode = nameNodes.find(
        (n) => (n as Konva.Text).text() === "Factory",
      )!;

      expect(parkNode.getParent()!.x()).toBeLessThan(factoryNode.getParent()!.x());
    });

    it("shows fallback text when a build is null", () => {
      view.updateBuilds(null, null);
      const all = texts(view);

      expect(all.filter((t) => t === "Unavailable")).toHaveLength(2);
      expect(all.filter((t) => t === "Stats unavailable")).toHaveLength(2);
    });

    it("handles one null build without affecting the other panel", () => {
      view.updateBuilds(park, null);
      const all = texts(view);

      expect(all).toContain("Park");
      expect(all).toContain("Unavailable");
    });

    it("replaces previous content on a second call", () => {
      view.updateBuilds(park, factory);
      view.updateBuilds(factory, park);
      const all = texts(view);

      expect(all.filter((t) => t === "Park")).toHaveLength(1);
      expect(all.filter((t) => t === "Factory")).toHaveLength(1);
    });

    it("clears the selection message", () => {
      view.showSelection(park);
      view.updateBuilds(park, factory);

      expect(texts(view).some((t) => t.startsWith("Previously Selected")))
        .toBe(false);
    });

    it("does not throw when the group has no layer", () => {
      expect(() => view.updateBuilds(park, factory)).not.toThrow();
    });
  });

  describe("showSelection", () => {
    it("shows the selected building's name", () => {
      view.showSelection(park);

      expect(texts(view)).toContain("Previously Selected: Park");
    });

    it("overwrites the previous selection message", () => {
      view.showSelection(park);
      view.showSelection(factory);
      const all = texts(view);

      expect(all).toContain("Previously Selected: Factory");
      expect(all).not.toContain("Previously Selected: Park");
    });
  });

  describe("select buttons", () => {
    it("calls only the left callback when the left button is clicked", () => {
      selectButtons(view)[0]!.fire("click");

      expect(onLeft).toHaveBeenCalledTimes(1);
      expect(onRight).not.toHaveBeenCalled();
    });

    it("calls only the right callback when the right button is clicked", () => {
      selectButtons(view)[1]!.fire("click");

      expect(onRight).toHaveBeenCalledTimes(1);
      expect(onLeft).not.toHaveBeenCalled();
    });

    it("also responds to tap events", () => {
      selectButtons(view)[0]!.fire("tap");
      selectButtons(view)[1]!.fire("tap");

      expect(onLeft).toHaveBeenCalledTimes(1);
      expect(onRight).toHaveBeenCalledTimes(1);
    });
  });

  describe("show / hide", () => {
    it("hides the group", () => {
      view.hide();

      expect(view.getGroup().visible()).toBe(false);
    });

    it("shows the group again after hiding", () => {
      view.hide();
      view.show();

      expect(view.getGroup().visible()).toBe(true);
    });
  });
});
