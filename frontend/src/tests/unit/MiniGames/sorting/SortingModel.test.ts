import { describe, expect, it } from "vitest";
import { DIFFICULTY, MAX_SPEED, MIN_SPEED, SortingModel, type Difficulty } from "../../../../MiniGames/sorting/SortingModel";
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

function first(model: SortingModel) {
    if (model.getActive().length === 0) model.update(0);
    return model.getActive()[0]!;
}

function sortCurrent(model: SortingModel, correct: boolean) {
    const falling = first(model);
    const wrong = BINS.find((b) => b !== falling.item.bin)!;
    return model.sort(falling.id, correct ? falling.item.bin : wrong);
}

describe("SortingModel", () => {
    it.each(["easy", "medium", "hard"] as const)("uses the item count and fall time for %s", (difficulty) => {
        const { items, fallMs } = DIFFICULTY[difficulty];
        const model = makeModel(difficulty);

        expect(model.getProgress().total).toBe(items);
        expect(model.update(fallMs - 1).missed).toHaveLength(0);
        expect(model.update(1).missed).toHaveLength(1);
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
        const falling = first(model).item;

        const { missed } = model.update(DIFFICULTY.easy.fallMs);

        expect(missed[0]!.item).toBe(falling);
        expect(model.getStats()).toMatchObject({ missed: 1, streak: 0 });
        expect(model.getProgress().done).toBe(2);
    });

    it("does not let a held item fall", () => {
        const model = makeModel("easy", ITEMS.slice(0, 1));
        model.grab(first(model).id);

        expect(model.update(60_000).missed).toHaveLength(0);
        expect(first(model).progress).toBe(0);
    });

    it("keeps falling from where a released item was dropped", () => {
        const model = makeModel();
        const { id } = first(model);
        model.grab(id);

        model.release(id, 0.3, 0.5);
        model.update(DIFFICULTY.easy.fallMs / 4);

        expect(first(model)).toMatchObject({ id, x: 0.3, progress: 0.75 });
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

    it("drops another item after the spawn time", () => {
        const model = makeModel();

        const { spawned } = model.update(DIFFICULTY.easy.spawnMs);

        expect(spawned).toHaveLength(1);
        expect(model.getActive()).toHaveLength(2);
    });

    it.each(["easy", "medium", "hard"] as const)("never has more than the max items on screen for %s", (difficulty) => {
        const { spawnMs, maxActive } = DIFFICULTY[difficulty];
        const model = makeModel(difficulty);
        for (const falling of model.getActive()) model.grab(falling.id);

        for (let i = 0; i < maxActive + 2; i++) {
            model.update(spawnMs);
            for (const falling of model.getActive()) model.grab(falling.id);
        }

        expect(model.getActive()).toHaveLength(maxActive);
    });

    it("lets other items fall and be missed while one is held", () => {
        const model = makeModel();
        const held = first(model);
        model.grab(held.id);
        model.update(DIFFICULTY.easy.spawnMs);

        const { missed } = model.update(DIFFICULTY.easy.fallMs);

        expect(missed).toHaveLength(1);
        expect(missed[0]!.id).not.toBe(held.id);
        expect(model.getActive().map((falling) => falling.id)).toContain(held.id);
    });

    it("gives each item a fall speed between the min and max", () => {
        const slow = new SortingModel(ITEMS, "easy", () => 0);
        const fast = new SortingModel(ITEMS, "easy", () => 0.999);

        expect(slow.getActive()[0]!.speed).toBe(MIN_SPEED);
        expect(fast.getActive()[0]!.speed).toBeCloseTo(MAX_SPEED, 2);
    });

    it("misses a fast item sooner than a slow one", () => {
        const model = new SortingModel(ITEMS, "easy", () => 0.999);
        const fallMs = DIFFICULTY.easy.fallMs;

        expect(model.update(fallMs / MAX_SPEED - 10).missed).toHaveLength(0);
        expect(model.update(20).missed).toHaveLength(1);
    });

    it("ends at once with no reward when there are no items", () => {
        const model = makeModel("easy", []);

        expect(model.isDone()).toBe(true);
        expect(model.sort(0, "trash")).toBeNull();
        expect(model.update(60_000)).toEqual({ spawned: [], missed: [] });
        expect(model.getResult()).toEqual({ delta: {}, summary: "No items to sort" });
    });
});
