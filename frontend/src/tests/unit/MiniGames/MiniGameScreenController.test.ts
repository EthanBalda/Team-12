import { beforeEach, describe, expect, it, vi } from "vitest";
import { MiniGameScreenController } from "../../../screens/MiniGameScreen/MiniGameScreenControl";
import type { MinigameContext, MinigameResult } from "../../../MiniGames/types";
import type { Screen } from "../../../types";

const mocks = vi.hoisted(() => ({
    view: {
        setTitle: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        resetCursor: vi.fn(),
        getGameArea: vi.fn(),
        getGameAreaSize: vi.fn(),
    },
    createGame: vi.fn(),
    onQuit: { current: () => {} },
}));

vi.mock("../../../screens/MiniGameScreen/MiniGameScreenView", () => ({
    MiniGameScreenView: class {
        constructor(onQuit: () => void) {
            mocks.onQuit.current = onQuit;
            return mocks.view;
        }
    },
}));

vi.mock("../../../minigames/registry", () => ({
    MINIGAMES: { test: () => mocks.createGame() },
}));

function makeGame() {
    return { title: "Fake", start: vi.fn<(ctx: MinigameContext) => void>(), destroy: vi.fn() };
}

describe("MiniGameScreenController", () => {
    const gameArea = { name: "game area" };
    const result: MinigameResult = { delta: { money: 1000 }, summary: "+$1,000" };

    let onComplete: ReturnType<typeof vi.fn<(result: MinigameResult) => void>>;
    let switchToScreen: ReturnType<typeof vi.fn<(screen: Screen) => void>>;
    let controller: MiniGameScreenController;
    let game: ReturnType<typeof makeGame>;

    beforeEach(() => {
        mocks.view.getGameArea.mockReturnValue(gameArea);
        mocks.view.getGameAreaSize.mockReturnValue({ width: 1200, height: 720 });

        game = makeGame();
        mocks.createGame.mockReturnValue(game);

        onComplete = vi.fn<(result: MinigameResult) => void>();
        switchToScreen = vi.fn<(screen: Screen) => void>(() => controller.hide());
        controller = new MiniGameScreenController({ switchToScreen }, onComplete);
    });

    it("shows the screen and starts the minigame in the game area", () => {
        controller.play("test");

        expect(mocks.view.setTitle).toHaveBeenCalledExactlyOnceWith("Fake");
        expect(mocks.view.show).toHaveBeenCalledOnce();
        expect(game.start).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ group: gameArea, width: 1200, height: 720 }),
        );
    });

    it("destroys a running minigame before starting another", () => {
        const secondGame = makeGame();
        controller.play("test");
        mocks.createGame.mockReturnValue(secondGame);

        controller.play("test");

        expect(game.destroy).toHaveBeenCalledOnce();
        expect(secondGame.start).toHaveBeenCalledOnce();
    });

    it("sends the result to the city and resumes it when a minigame finishes", () => {
        controller.play("test");

        game.start.mock.calls[0]![0].finish(result);

        expect(onComplete).toHaveBeenCalledExactlyOnceWith(result);
        expect(switchToScreen).toHaveBeenCalledExactlyOnceWith({ type: "resumeGame" });
        expect(game.destroy).toHaveBeenCalledOnce();
    });

    it("resumes the city with no reward when the player quits", () => {
        controller.play("test");

        mocks.onQuit.current();

        expect(onComplete).not.toHaveBeenCalled();
        expect(switchToScreen).toHaveBeenCalledExactlyOnceWith({ type: "resumeGame" });
        expect(game.destroy).toHaveBeenCalledOnce();
    });

    it("can hide when no minigame is running", () => {
        expect(() => controller.hide()).not.toThrow();
        expect(mocks.view.hide).toHaveBeenCalledOnce();
    });
});