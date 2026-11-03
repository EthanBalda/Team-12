import { afterEach, describe, expect, it, vi } from "vitest";
import {
  compareScreenModel,
  type Build,
} from "../../../screens/BuildingScreen/CompareScreenModel";
import buildingsData from "../../../screens/BuildingScreen/buildOptions.json";

const allBuilds = buildingsData as Build[];
const maxTier = Math.max(...allBuilds.map((b) => b.tier));

describe("compareScreenModel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts on tier 1 with no builds selected", () => {
      const model = new compareScreenModel();

      expect(model.getCurrentTier()).toBe(1);
      expect(model.getLeftBuild()).toBeNull();
      expect(model.getRightBuild()).toBeNull();
    });
  });

  describe("buildOptions.json data", () => {
    it("has every required field on every building", () => {
      for (const build of allBuilds) {
        expect(typeof build.name).toBe("string");
        expect(typeof build.money).toBe("number");
        expect(typeof build.happiness).toBe("number");
        expect(typeof build.pollution).toBe("number");
        expect(typeof build.tier).toBe("number");
      }
    });

    it("has unique building names", () => {
      const names = allBuilds.map((b) => b.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it("has tiers numbered 1..max with no gaps", () => {
      const tiers = new Set(allBuilds.map((b) => b.tier));

      for (let tier = 1; tier <= maxTier; tier++) {
        expect(tiers.has(tier)).toBe(true);
      }
    });

    it("has at least two buildings in every tier so a pair can be picked", () => {
      for (let tier = 1; tier <= maxTier; tier++) {
        expect(allBuilds.filter((b) => b.tier === tier).length)
          .toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("pickNewPair", () => {
    it("picks two buildings from the current tier", () => {
      const model = new compareScreenModel();
      model.pickNewPair();

      expect(model.getLeftBuild()).not.toBeNull();
      expect(model.getRightBuild()).not.toBeNull();
      expect(model.getLeftBuild()!.tier).toBe(1);
      expect(model.getRightBuild()!.tier).toBe(1);
    });

    it("never picks the same building twice", () => {
      const model = new compareScreenModel();

      for (let i = 0; i < 200; i++) {
        model.pickNewPair();
        expect(model.getLeftBuild()!.name)
          .not.toBe(model.getRightBuild()!.name);
      }
    });

    it("always stays inside the current tier over many picks", () => {
      const model = new compareScreenModel();

      for (let tier = 1; tier <= maxTier; tier++) {
        for (let i = 0; i < 50; i++) {
          model.pickNewPair();
          expect(model.getLeftBuild()!.tier).toBe(tier);
          expect(model.getRightBuild()!.tier).toBe(tier);
        }
        model.advanceTier();
      }
    });

    it("picks buildings from the JSON list", () => {
      const model = new compareScreenModel();
      model.pickNewPair();

      expect(allBuilds).toContainEqual(model.getLeftBuild());
      expect(allBuilds).toContainEqual(model.getRightBuild());
    });

    it("is deterministic when Math.random is mocked low", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const model = new compareScreenModel();

      model.pickNewPair();

      expect(model.getLeftBuild()!.name).toBe("Fossil-Fuel Power Plant");
      expect(model.getRightBuild()!.name).toBe("Park");
    });

    it("is deterministic when Math.random is mocked high", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.999);
      const model = new compareScreenModel();

      model.pickNewPair();

      expect(model.getLeftBuild()!.name).toBe("Refinery");
      expect(model.getRightBuild()!.name).toBe("Factory");
    });

    it("eventually produces different pairs", () => {
      const model = new compareScreenModel();
      const seen = new Set<string>();

      for (let i = 0; i < 100; i++) {
        model.pickNewPair();
        seen.add(`${model.getLeftBuild()!.name}|${model.getRightBuild()!.name}`);
      }

      expect(seen.size).toBeGreaterThan(1);
    });

    it("leaves the right build null when the tier has only one building", () => {
      const model = new compareScreenModel();
      (model as any).buildings = [allBuilds[0]];

      model.pickNewPair();

      expect(model.getLeftBuild()).toEqual(allBuilds[0]);
      expect(model.getRightBuild()).toBeNull();
    });

    it("leaves both builds null when the tier has no buildings", () => {
      const model = new compareScreenModel();
      (model as any).buildings = [];

      model.pickNewPair();

      expect(model.getLeftBuild()).toBeNull();
      expect(model.getRightBuild()).toBeNull();
    });
  });

  describe("advanceTier", () => {
    it("moves up one tier and returns true", () => {
      const model = new compareScreenModel();

      expect(model.advanceTier()).toBe(true);
      expect(model.getCurrentTier()).toBe(2);
    });

    it("can advance all the way to the highest tier", () => {
      const model = new compareScreenModel();

      for (let tier = 1; tier < maxTier; tier++) {
        expect(model.advanceTier()).toBe(true);
      }

      expect(model.getCurrentTier()).toBe(maxTier);
    });

    it("returns false and stays put on the highest tier", () => {
      const model = new compareScreenModel();
      for (let tier = 1; tier < maxTier; tier++) model.advanceTier();

      expect(model.advanceTier()).toBe(false);
      expect(model.advanceTier()).toBe(false);
      expect(model.getCurrentTier()).toBe(maxTier);
    });

    it("does not change the currently displayed pair", () => {
      const model = new compareScreenModel();
      model.pickNewPair();
      const left = model.getLeftBuild();
      const right = model.getRightBuild();

      model.advanceTier();

      expect(model.getLeftBuild()).toBe(left);
      expect(model.getRightBuild()).toBe(right);
    });

    it("makes the next pair come from the new tier", () => {
      const model = new compareScreenModel();
      model.advanceTier();
      model.pickNewPair();

      expect(model.getLeftBuild()!.tier).toBe(2);
      expect(model.getRightBuild()!.tier).toBe(2);
    });
  });
});
