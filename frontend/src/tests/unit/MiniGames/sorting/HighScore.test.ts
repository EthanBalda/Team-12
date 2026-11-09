import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalHighScoreStore, recordHighScore, type HighScoreStore } from "../../../../MiniGames/sorting/highScore";

function makeStore(score: number) {
    return { get: vi.fn(() => score), save: vi.fn<(score: number) => void>() } satisfies HighScoreStore;
}

describe("highScore", () => {
    describe("recordHighScore", () => {
        it("saves a score that beats the high score", () => {
            const store = makeStore(500);

            expect(recordHighScore(store, 800)).toEqual({ best: 800, isNew: true });
            expect(store.save).toHaveBeenCalledExactlyOnceWith(800);
        });

        it.each([300, 500])("keeps the high score when the score is %i", (score) => {
            const store = makeStore(500);

            expect(recordHighScore(store, score)).toEqual({ best: 500, isNew: false });
            expect(store.save).not.toHaveBeenCalled();
        });
    });

    describe("LocalHighScoreStore", () => {
        beforeEach(() => {
            window.localStorage.clear();
        });

        it("starts at 0 and returns a saved score", () => {
            const store = new LocalHighScoreStore("test");
            expect(store.get()).toBe(0);

            store.save(750);

            expect(store.get()).toBe(750);
        });

        it("keeps working when browser storage is blocked", () => {
            vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
                throw new Error("blocked");
            });
            vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw new Error("blocked");
            });
            const store = new LocalHighScoreStore("test");

            expect(store.get()).toBe(0);
            expect(() => store.save(100)).not.toThrow();
        });
    });
});
