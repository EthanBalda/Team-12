
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Minigame } from "../../../minigames/Minigames";
import type { MinigameContext, MinigameResult } from "../../../minigames/types";

const animation = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));

vi.mock("konva", () => ({
    default: {
        Animation: class {
            start = animation.start;
            stop = animation.stop;
        },
    },
}));

class FakeMinigame extends Minigame {
    readonly title = "Fake";
    setupCalls = 0;

    protected setup(): void {
        this.setupCalls++;
    }

    callFinish(result: MinigameResult): void {
        this.finish(result);
    }

    callAddTimeout(callback: () => void, ms: number): void {
        this.addTimeout(callback, ms);
    }

    callAddAnimation(): void {
        this.addAnimation(() => {});
    }
}

describe("Minigame", () => {
    const result: MinigameResult = { delta: { money: 1000 }, summary: "+$1,000" };

    let destroyChildren: ReturnType<typeof vi.fn>;
    let finish: ReturnType<typeof vi.fn<(result: MinigameResult) => void>>;
    let game: FakeMinigame;

    beforeEach(() => {
        vi.useFakeTimers();

        destroyChildren = vi.fn();
        finish = vi.fn<(result: MinigameResult) => void>();
        game = new FakeMinigame();
        game.start({
            group: { destroyChildren, getLayer: () => null },
            width: 1200,
            height: 720,
            finish,
        } as unknown as MinigameContext);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("runs setup once when started", () => {
        expect(game.setupCalls).toBe(1);
    });

    it("reports the result to the host", () => {
        game.callFinish(result);

        expect(finish).toHaveBeenCalledExactlyOnceWith(result);
    });

    it("only pays out once when finished twice", () => {
        game.callFinish(result);
        game.callFinish({ delta: { money: 5000 }, summary: "second" });

        expect(finish).toHaveBeenCalledExactlyOnceWith(result);
    });

    it("blocks finish after the player quits", () => {
        game.destroy();
        game.callFinish(result);

        expect(finish).not.toHaveBeenCalled();
    });

    it("removes the minigame's shapes when destroyed", () => {
        game.destroy();

        expect(destroyChildren).toHaveBeenCalledOnce();
    });

    it("cancels pending timeouts when destroyed", () => {
        const callback = vi.fn();
        game.callAddTimeout(callback, 1000);

        game.destroy();
        vi.advanceTimersByTime(1000);

        expect(callback).not.toHaveBeenCalled();
    });

    it("stops running animations when destroyed", () => {
        game.callAddAnimation();
        expect(animation.start).toHaveBeenCalledOnce();

        game.destroy();

        expect(animation.stop).toHaveBeenCalledOnce();
    });
});