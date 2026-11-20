
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from "vitest";

import { InstructionsScreenController } from "../../../screens/InstructionsScreen/InstructionsScreenController.ts";
import type { ScreenSwitcher } from "../../../types.ts";

const callbacks = vi.hoisted(() => ({
    onGoBack: () => {},
    show: vi.fn(),
    hide: vi.fn(),
}));

vi.mock(
    "../../../screens/InstructionsScreen/InstructionsScreenView.ts",
    () => ({
        InstructionsScreenView: class {
            constructor(onGoBack: () => void) {
                callbacks.onGoBack = onGoBack;
            }

            show = callbacks.show;
            hide = callbacks.hide;
        },
    }),
);

describe("InstructionsScreenController", () => {
    let controller: InstructionsScreenController;

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

        controller = new InstructionsScreenController(screenSwitcher);
    });

    it("requests the Start screen when Go Back is selected", () => {
        callbacks.onGoBack();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "start",
        });
    });

    it("does not switch screens before Go Back is selected", () => {
        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("shows the Instructions screen through its view", () => {
        controller.show();

        expect(callbacks.show).toHaveBeenCalledOnce();
    });

    it("hides the Instructions screen through its view", () => {
        controller.hide();

        expect(callbacks.hide).toHaveBeenCalledOnce();
    });

    it("returns its view through getView()", () => {
        expect(controller.getView()).toBeDefined();
    });

    it("does not request multiple screen changes for one Go Back action", () => {
        callbacks.onGoBack();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();
    });

    it("can return to the Start screen more than once", () => {
        callbacks.onGoBack();
        callbacks.onGoBack();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledTimes(2);

        expect(screenSwitcher.switchToScreen).toHaveBeenNthCalledWith(1, {
            type: "start",
        });

        expect(screenSwitcher.switchToScreen).toHaveBeenNthCalledWith(2, {
            type: "start",
        });
    });
});
