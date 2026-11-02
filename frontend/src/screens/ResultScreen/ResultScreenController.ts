import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { ResultScreenView } from "./ResultScreenView.ts";

export class ResultScreenController extends ScreenController{
    private view: ResultScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher){
        super();

        this.screenSwitcher = screenSwitcher;

        this.view = new ResultScreenView(
            () => this.handleContinue(),
            () => this.handleNewGame(),
        );
    }

    private handleContinue(): void{
        this.screenSwitcher.switchToScreen({type: "mainGame"});

    }

    private handleNewGame(): void{
        this.screenSwitcher.switchToScreen({type: "createWorld"})
    }

    showResult(success: boolean): void {
        this.view.show_result(success);
    }

    show(): void{
        this.view.getGroup().show();
    }

    hide(): void{
        this.view.getGroup().hide();
    }

    getView(): ResultScreenView{
        return this.view;
    }
}


