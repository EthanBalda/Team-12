
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from "vitest";

import { StartScreenController } from "../../../screens/StartScreen/StartScreenController.ts";
import type { ScreenSwitcher } from "../../../types.ts";

const callbacks = vi.hoisted(() => ({
    onStartNewGame: () => {},
    onContinueGame: () => {},
    onHowToPlay: () => {},
    show: vi.fn(),
    hide: vi.fn(),
}));

vi.mock(
    "../../../screens/StartScreen/StartScreenView.ts",
    () => ({
        StartScreenView: class {
            constructor(
                onStartNewGame: () => void,
                onContinueGame: () => void,
                onHowToPlay: () => void,
            ) {
                callbacks.onStartNewGame = onStartNewGame;
                callbacks.onContinueGame = onContinueGame;
                callbacks.onHowToPlay = onHowToPlay;
            }

            show = callbacks.show;
            hide = callbacks.hide;
        },
    }),
);

describe("StartScreenController", () => {
    let controller: StartScreenController;

    let screenSwitcher: {
        switchToScreen: ReturnType<
            typeof vi.fn<ScreenSwitcher["switchToScreen"]>
        >;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        screenSwitcher = {
            switchToScreen: vi.fn<ScreenSwitcher["switchToScreen"]>(),
        };

        controller = new StartScreenController(screenSwitcher);
    });

    it("requests createWorld when starting a new game", () => {
        callbacks.onStartNewGame();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "createWorld",
        });
    });

    it("requests loginWorld when continuing an existing game", () => {
        callbacks.onContinueGame();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "loginWorld",
        });
    });

    it("requests instructions when How to play is selected", () => {
        callbacks.onHowToPlay();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "instructions",
        });
    });

    it("does not switch screens before a callback is invoked", () => {
        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("shows the Start screen through its view", () => {
        controller.show();

        expect(callbacks.show).toHaveBeenCalledOnce();
    });

    it("hides the Start screen through its view", () => {
        controller.hide();

        expect(callbacks.hide).toHaveBeenCalledOnce();
    });

    it("returns its view through getView()", () => {
        expect(controller.getView()).toBeDefined();
    });

    it("does not request multiple screen changes for one callback", () => {
        callbacks.onStartNewGame();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
    });

    it("can request different screens through different callbacks", () => {
        callbacks.onStartNewGame();
        callbacks.onContinueGame();
        callbacks.onHowToPlay();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(3);

        expect(screenSwitcher.switchToScreen).toHaveBeenNthCalledWith(1, {
            type: "createWorld",
        });

        expect(screenSwitcher.switchToScreen).toHaveBeenNthCalledWith(2, {
            type: "loginWorld",
        });

        expect(screenSwitcher.switchToScreen).toHaveBeenNthCalledWith(3, {
            type: "instructions",
        });
    });
});
