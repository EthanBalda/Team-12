
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { InstructionsScreenView } from "./InstructionsScreenView.ts";

export class InstructionsScreenController extends ScreenController {
    private view: InstructionsScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();

        this.screenSwitcher = screenSwitcher;

        this.view = new InstructionsScreenView(() => {
            this.screenSwitcher.switchToScreen({
                type: "start"
            });
        });
    }

    getView(): InstructionsScreenView {
        return this.view;
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }
}
