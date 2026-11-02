import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResultScreenController } from "../../../screens/ResultScreen/ResultScreenController";
import type { ScreenSwitcher } from "../../../types.ts";

const callbacks = vi.hoisted(() => ({
    onContinue: () => {},
    onNewGame: () => {},
}));

vi.mock("../../../screens/ResultScreen/ResultScreenView.ts", () => ({
    ResultScreenView: class {
        constructor(
            onContinue: () => void,
            onNewGame: () => void,
        ) {
            callbacks.onContinue = onContinue;
            callbacks.onNewGame = onNewGame;
        }
    },
}));

describe("ResultScreenController", () => {
    let screenSwitcher: {
        switchToScreen: ReturnType<
            typeof vi.fn<ScreenSwitcher["switchToScreen"]>
        >;
    };

    beforeEach(() => {
        screenSwitcher = {
            switchToScreen: vi.fn<ScreenSwitcher["switchToScreen"]>(),
        };

        new ResultScreenController(screenSwitcher);
    });

    it("requests resumeGame when continuing", () => {
        callbacks.onContinue();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "resumeGame",
        });
    });

    it("requests mainGame when starting a new game", () => {
        callbacks.onNewGame();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "mainGame",
        });
    });
});