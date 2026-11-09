import { describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { SortingMinigame } from "../../../../MiniGames/sorting/SortingMinigame";
import { DIFFICULTY } from "../../../../MiniGames/sorting/SortingModel";
import type { Bin, SortItem } from "../../../../MiniGames/sorting/items";
import type { HighScoreStore } from "../../../../MiniGames/sorting/highScore";
import type { MiniGameResult } from "../../../../MiniGames/types";

const animation = vi.hoisted(() => ({
    onFrame: null as ((frame: { timeDiff: number }) => void) | null,
}));

vi.mock("konva", async (importOriginal) => {
    const { default: actual } = await importOriginal<typeof import("konva")>();
    class FakeAnimation {
        constructor(onFrame: (frame: { timeDiff: number }) => void) {
            animation.onFrame = onFrame;
        }
        start() {}
        stop() {
            animation.onFrame = null;
        }
    }
    return { default: { ...actual, Animation: FakeAnimation } };
});

function passTime(ms: number): void {
    for (let elapsed = 0; elapsed < ms; elapsed += 100) animation.onFrame?.({ timeDiff: 100 });
}

const BIN_LABELS: Record<Bin, string> = { recycling: "Recycling", compost: "Compost", trash: "Trash" };

const ITEMS: SortItem[] = Array.from({ length: 8 }, (_, i) => ({
    name: `Item ${i}`,
    bin: (["recycling", "compost", "trash"] as const)[i % 3]!,
    tip: `Tip ${i}.`,
}));

function startGame(items: SortItem[] = ITEMS, highScore = 0) {
    const group = new Konva.Group();
    const finish = vi.fn<(result: MiniGameResult) => void>();
    const store = { get: vi.fn(() => highScore), save: vi.fn<(score: number) => void>() } satisfies HighScoreStore;
    new SortingMinigame({ items, store, random: () => 0 }).start({ group, width: 1200, height: 720, finish });
    return { group, finish, store };
}

function texts(group: Konva.Group): string[] {
    return group.find<Konva.Text>("Text").map((node) => node.text());
}

function hasText(group: Konva.Group, prefix: string): boolean {
    return texts(group).some((text) => text.startsWith(prefix));
}

function click(group: Konva.Group, label: string): void {
    const text = group.find<Konva.Text>("Text").find((node) => node.text() === label);
    if (!text) throw new Error(`No button labeled "${label}"`);
    text.getParent()!.fire("click");
}

function currentItem(group: Konva.Group): SortItem {
    const name = texts(group).find((text) => text.startsWith("Item ") && !text.includes(" of "));
    return ITEMS.find((item) => item.name === name)!;
}

function drag(group: Konva.Group, bin: Bin): void {
    const item = group.find((node: Konva.Node) => node.draggable())[0]!;
    const label = group.find<Konva.Text>("Text").find((node) => node.text() === BIN_LABELS[bin])!;
    item.fire("dragstart");
    item.position({ x: label.x() + 40, y: label.y() + 40 });
    item.fire("dragend");
}

function sortCurrent(group: Konva.Group, correct: boolean): void {
    const { bin } = currentItem(group);
    drag(group, correct ? bin : bin === "trash" ? "compost" : "trash");
}

describe("SortingMinigame", () => {
    it("starts a round after the player picks a difficulty", () => {
        const { group } = startGame();
        expect(hasText(group, "Pick a difficulty")).toBe(true);

        click(group, "Easy");

        expect(hasText(group, "Item 1 of 8 | Score 0 | Streak 0")).toBe(true);
    });

    it("gives points when an item is dragged to the right bin", () => {
        const { group } = startGame();
        click(group, "Easy");
        const { tip } = currentItem(group);

        sortCurrent(group, true);

        expect(hasText(group, `Correct! +100. ${tip}`)).toBe(true);
        expect(hasText(group, "Item 2 of 8 | Score 100 | Streak 1")).toBe(true);
    });

    it("shows the tip when an item is dragged to the wrong bin", () => {
        const { group } = startGame();
        click(group, "Easy");
        const { tip } = currentItem(group);

        sortCurrent(group, false);

        expect(hasText(group, `Wrong bin. ${tip}`)).toBe(true);
        expect(hasText(group, "Item 2 of 8 | Score 0 | Streak 0")).toBe(true);
    });

    it("stops the falling item while the player holds it", () => {
        const { group } = startGame();
        click(group, "Easy");
        group.find((node: Konva.Node) => node.draggable())[0]!.fire("dragstart");

        passTime(DIFFICULTY.easy.fallMs * 2);

        expect(hasText(group, "Missed!")).toBe(false);
        expect(hasText(group, "Item 1 of 8")).toBe(true);
    });

    it("counts an item as missed when it falls to the bins", () => {
        const { group } = startGame();
        click(group, "Easy");

        passTime(DIFFICULTY.easy.fallMs);

        expect(hasText(group, "Missed!")).toBe(true);
        expect(hasText(group, "Item 1 of 8")).toBe(false);
    });

    it("shows the results and saves a new high score at the end of the round", () => {
        const { group, finish, store } = startGame(ITEMS, 100);
        click(group, "Easy");
        sortCurrent(group, true);
        sortCurrent(group, true);
        while (!hasText(group, "Round over")) sortCurrent(group, false);

        expect(hasText(group, "Sorted correctly: 2 of 8")).toBe(true);
        expect(hasText(group, "New high score: 220!")).toBe(true);
        expect(store.save).toHaveBeenCalledExactlyOnceWith(220);
        expect(animation.onFrame).toBeNull();

        click(group, "Back to city");
        expect(finish).toHaveBeenCalledExactlyOnceWith({
            delta: { money: 1100 },
            summary: "2/8 sorted, +$1,100",
        });
    });

    it("lets the player go back to the city when there are no items", () => {
        const { group, finish } = startGame([]);
        click(group, "Easy");

        expect(hasText(group, "No items to sort right now.")).toBe(true);
        click(group, "Back to city");
        expect(finish).toHaveBeenCalledExactlyOnceWith({ delta: {}, summary: "No items to sort" });
    });
});
