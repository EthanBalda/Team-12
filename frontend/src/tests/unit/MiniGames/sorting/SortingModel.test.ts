import { describe, expect, it } from "vitest";
import { DIFFICULTY, SortingModel, type Difficulty } from "../../../../MiniGames/sorting/SortingModel";
import type { Bin, SortItem } from "../../../../MiniGames/sorting/items";

const BINS: Bin[] = ["recycling", "compost", "trash"];

const ITEMS: SortItem[] = Array.from({ length: 12 }, (_, i) => ({
    name: `Item ${i}`,
    bin: BINS[i % 3]!,
    tip: `Tip ${i}`,
}));

function makeModel(difficulty: Difficulty = "easy", items: SortItem[] = ITEMS): SortingModel {
    return new SortingModel(items, difficulty, () => 0);
}

function sortCurrent(model: SortingModel, correct: boolean) {
    const { bin } = model.getCurrent()!.item;
    const wrong = BINS.find((b) => b !== bin)!;
    return model.sort(correct ? bin : wrong);
}

describe("SortingModel", () => {
    it.each(["easy", "medium", "hard"] as const)("uses the item count and fall time for %s", (difficulty) => {
        const { items, fallMs } = DIFFICULTY[difficulty];
        const model = makeModel(difficulty);

        expect(model.getProgress().total).toBe(items);
        expect(model.update(fallMs - 1)).toBeNull();
        expect(model.update(1)).not.toBeNull();
    });

    it("gives points and starts a streak for a correct sort", () => {
        const model = makeModel();

        const feedback = sortCurrent(model, true);

        expect(feedback).toMatchObject({ correct: true, points: 100, streak: 1 });
        expect(model.getStats().score).toBe(100);
    });

    it("gives no points and resets the streak for a wrong sort", () => {
        const model = makeModel();
        sortCurrent(model, true);

        const feedback = sortCurrent(model, false);

        expect(feedback).toMatchObject({ correct: false, points: 0, streak: 0 });
        expect(model.getStats()).toMatchObject({ score: 100, streak: 0, bestStreak: 1 });
    });

    it("adds a bonus for each correct sort in a row", () => {
        const model = makeModel();

        const points = [1, 2, 3].map(() => sortCurrent(model, true)!.points);

        expect(points).toEqual([100, 120, 140]);
    });

    it("caps the streak bonus at 100", () => {
        const model = makeModel("hard");

        const points = Array.from({ length: 8 }, () => sortCurrent(model, true)!.points);

        expect(points.slice(-3)).toEqual([200, 200, 200]);
    });

    it("counts a miss and resets the streak when an item reaches the bins", () => {
        const model = makeModel();
        sortCurrent(model, true);
        const falling = model.getCurrent()!.item;

        const missed = model.update(DIFFICULTY.easy.fallMs);

        expect(missed).toBe(falling);
        expect(model.getStats()).toMatchObject({ missed: 1, streak: 0 });
        expect(model.getProgress().current).toBe(3);
    });

    it("does not let a held item fall", () => {
        const model = makeModel();
        model.grab();

        expect(model.update(60_000)).toBeNull();
        expect(model.getCurrent()!.progress).toBe(0);
    });

    it("keeps falling from where a released item was dropped", () => {
        const model = makeModel();
        model.grab();

        model.release(0.3, 0.5);
        model.update(DIFFICULTY.easy.fallMs / 4);

        expect(model.getCurrent()).toMatchObject({ x: 0.3, progress: 0.75 });
    });

    it("pays $5 per point at the end of the round", () => {
        const model = makeModel();
        sortCurrent(model, true);
        sortCurrent(model, true);
        while (!model.isDone()) sortCurrent(model, false);

        expect(model.getResult()).toEqual({
            delta: { money: 1100 },
            summary: "2/8 sorted, +$1,100",
        });
    });

    it("ends at once with no reward when there are no items", () => {
        const model = makeModel("easy", []);

        expect(model.isDone()).toBe(true);
        expect(model.sort("trash")).toBeNull();
        expect(model.update(60_000)).toBeNull();
        expect(model.getResult()).toEqual({ delta: {}, summary: "No items to sort" });
    });
});
