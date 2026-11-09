import { describe, expect, it } from "vitest";
import { BINS, SORT_ITEMS } from "../../../../MiniGames/sorting/items";
import { DIFFICULTY } from "../../../../MiniGames/sorting/SortingModel";

describe("SORT_ITEMS", () => {
    it("has enough items for the hardest round", () => {
        const most = Math.max(...Object.values(DIFFICULTY).map((d) => d.items));

        expect(SORT_ITEMS.length).toBeGreaterThanOrEqual(most);
    });

    it("gives every item a valid bin and a tip", () => {
        for (const item of SORT_ITEMS) {
            expect(BINS).toContain(item.bin);
            expect(item.tip.trim()).not.toBe("");
        }
    });

    it("uses every bin", () => {
        expect(new Set(SORT_ITEMS.map((item) => item.bin))).toEqual(new Set(BINS));
    });
});
