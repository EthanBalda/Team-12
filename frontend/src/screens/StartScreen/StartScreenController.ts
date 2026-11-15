
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { StartScreenView } from "./StartScreenView.ts";

export class StartScreenController extends ScreenController {
    private view: StartScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();

        this.screenSwitcher = screenSwitcher;

        this.view = new StartScreenView(
            // Start a new game
            () => {
                this.screenSwitcher.switchToScreen({
                    type: "createWorld"
                });
            },

            // Continue an existing game
            () => {
                this.screenSwitcher.switchToScreen({
                    type: "loginWorld"
                });
            },

            // How to play
            () => {
                this.screenSwitcher.switchToScreen({
                    type: "instructions"
                });
            }
        );
    }

    getView(): StartScreenView {
        return this.view;
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }
}
