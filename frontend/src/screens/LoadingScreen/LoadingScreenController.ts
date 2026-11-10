import { ScreenController } from "../../types";
import { LoadingScreenView } from "./LoadingScreenView";

export class LoadingScreenController extends ScreenController {
    private view: LoadingScreenView;

    constructor() {
        super();
        this.view = new LoadingScreenView();
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }

    getView(): LoadingScreenView {
        return this.view;
    }
}