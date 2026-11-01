import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { compareScreenModel, type Build } from "./compareScreenModel.ts";
import { compareScreenView } from "./compareScreenView.ts";

/**
 * compareScreenController - Handles interactions necessary for comparison
 */
export class compareScreenController extends ScreenController {
	private model: compareScreenModel;
	private view: compareScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new compareScreenModel();
		this.view = new compareScreenView(() => this.handleStartClick());
	}

	/**
	 * Show the compare and refresh the stats so they include the latest game
	 */
	show(): void {
		super.show();
		this.refreshStats();
	}

	/**
	 * Get the view
	 */
	getView(): compareScreenView {
		return this.view;
	}
}