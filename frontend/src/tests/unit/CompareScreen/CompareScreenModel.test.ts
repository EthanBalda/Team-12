import { afterEach, describe, expect, it, vi } from "vitest";
import {
  compareScreenModel,
  type Build,
} from "../../../screens/CompareScreen/CompareScreenModel";
import buildingsData from "../../../screens/CompareScreen/buildOptions.json";

const allBuilds = buildingsData as Build[];
const maxTier = Math.max(...allBuilds.map((b) => b.tier));
const CHOICE_COUNT = 3;

describe("compareScreenModel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts on tier 1 with no choices", () => {
      const model = new compareScreenModel();

      expect(model.getCurrentTier()).toBe(1);
      expect(model.getChoices()).toEqual([]);
    });
  });

  describe("buildOptions.json data", () => {
    it("has every required field on every building", () => {
      for (const build of allBuilds) {
        expect(typeof build.name).toBe("string");
        expect(typeof build.type).toBe("string");
        expect(build.type.length).toBeGreaterThan(0);
        expect(typeof build.money).toBe("number");
        expect(typeof build.pollution).toBe("number");
        expect(typeof build.tier).toBe("number");
      }
    });

    it("has image keys without spaces or uppercase (they map to PNG filenames)", () => {
      for (const build of allBuilds) {
        expect(build.type).toMatch(/^[a-z0-9-]+$/);
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

    it("has enough buildings in every tier to fill all choices", () => {
      for (let tier = 1; tier <= maxTier; tier++) {
        expect(allBuilds.filter((b) => b.tier === tier).length)
          .toBeGreaterThanOrEqual(CHOICE_COUNT);
      }
    });
  });

  describe("pickNewChoices", () => {
    it("returns three non-null buildings from the current tier", () => {
      const model = new compareScreenModel();
      model.pickNewChoices();

      const choices = model.getChoices();
      expect(choices).toHaveLength(CHOICE_COUNT);

      for (const choice of choices) {
        expect(choice).not.toBeNull();
        expect(choice!.tier).toBe(1);
      }
    });

    it("never repeats a building within one set of choices", () => {
      const model = new compareScreenModel();

      for (let i = 0; i < 200; i++) {
        model.pickNewChoices();
        const names = model.getChoices().map((c) => c!.name);
        expect(new Set(names).size).toBe(CHOICE_COUNT);
      }
    });

    it("stays inside the current tier for every tier", () => {
      const model = new compareScreenModel();

      for (let tier = 1; tier <= maxTier; tier++) {
        model.setTier(tier);

        for (let i = 0; i < 50; i++) {
          model.pickNewChoices();
          for (const choice of model.getChoices()) {
            expect(choice!.tier).toBe(tier);
          }
        }
      }
    });

    it("picks buildings from the JSON list", () => {
      const model = new compareScreenModel();
      model.pickNewChoices();

      for (const choice of model.getChoices()) {
        expect(allBuilds).toContainEqual(choice);
      }
    });

    // Tier 1 pool order: Fossil-Fuel Power Plant, Park, Factory, Refinery.
    // These two tests depend on the Fisher-Yates shuffle in pickNewChoices.
    it("is deterministic when Math.random is mocked low", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const model = new compareScreenModel();

      model.pickNewChoices();

      expect(model.getChoices().map((c) => c!.name)).toEqual([
        "Park",
        "Factory",
        "Refinery",
      ]);
    });

    it("is deterministic when Math.random is mocked high", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.999);
      const model = new compareScreenModel();

      model.pickNewChoices();

      expect(model.getChoices().map((c) => c!.name)).toEqual([
        "Fossil-Fuel Power Plant",
        "Park",
        "Factory",
      ]);
    });

    it("eventually produces different sets", () => {
      const model = new compareScreenModel();
      const seen = new Set<string>();

      for (let i = 0; i < 100; i++) {
        model.pickNewChoices();
        seen.add(model.getChoices().map((c) => c!.name).join("|"));
      }

      expect(seen.size).toBeGreaterThan(1);
    });

    it("does not mutate the building list", () => {
      const model = new compareScreenModel();
      const namesBefore = allBuilds.map((b) => b.name);

      model.pickNewChoices();

      expect(allBuilds.map((b) => b.name)).toEqual(namesBefore);
    });

    it("pads with null when the tier has fewer buildings than choices", () => {
      const model = new compareScreenModel();
      (model as any).buildings = [allBuilds[0], allBuilds[1]];

      model.pickNewChoices();

      const choices = model.getChoices();
      expect(choices).toHaveLength(CHOICE_COUNT);
      expect(choices[0]).not.toBeNull();
      expect(choices[1]).not.toBeNull();
      expect(choices[2]).toBeNull();
    });

    it("returns all null when the tier has no buildings", () => {
      const model = new compareScreenModel();
      (model as any).buildings = [];

      model.pickNewChoices();

      expect(model.getChoices()).toEqual([null, null, null]);
    });
  });

  describe("setTier", () => {
    it("sets the current tier", () => {
      const model = new compareScreenModel();
      model.setTier(2);

      expect(model.getCurrentTier()).toBe(2);
    });

    it("clamps to the highest tier in the data", () => {
      const model = new compareScreenModel();
      model.setTier(maxTier + 10);

      expect(model.getCurrentTier()).toBe(maxTier);
    });

    it("clamps to a minimum of tier 1", () => {
      const model = new compareScreenModel();
      model.setTier(0);
      expect(model.getCurrentTier()).toBe(1);

      model.setTier(-5);
      expect(model.getCurrentTier()).toBe(1);
    });

    it("changes which buildings are offered", () => {
      const model = new compareScreenModel();
      model.setTier(maxTier);
      model.pickNewChoices();

      for (const choice of model.getChoices()) {
        expect(choice!.tier).toBe(maxTier);
      }
    });
  });

  describe("reset", () => {
    it("returns to tier 1", () => {
      const model = new compareScreenModel();
      model.setTier(maxTier);
      model.reset();

      expect(model.getCurrentTier()).toBe(1);
    });
  });
});