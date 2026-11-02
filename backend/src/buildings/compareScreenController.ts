import { ScreenController } from "./types";
import type { ScreenSwitcher } from "./types";
import { compareScreenModel, type Build } from "./compareScreenModel";
import { compareScreenView } from "./compareScreenView";

/**
 * compareScreenController - Handles interactions necessary for comparison
 */
export class compareScreenController extends ScreenController {
	private model: compareScreenModel;
	private view: compareScreenView;
	protected screenSwitcher: ScreenSwitcher;
	private onBuildSelected: ((build: Build) => void) | undefined;

	constructor(
		screenSwitcher: ScreenSwitcher,
		onBuildSelected?: (build: Build) => void,
	) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.onBuildSelected = onBuildSelected;
		this.model = new compareScreenModel();
		this.view = new compareScreenView(
			() => this.handleSelect("left"),
			() => this.handleSelect("right"),
		);
	}

	/**
	 * Show the screen with a fresh random pair of buildings
	 */
	show(): void {
		super.show();
		this.refreshBuilds();
	}

	private refreshBuilds(): void {
		this.model.pickNewPair();
		this.view.updateBuilds(
			this.model.getLeftBuild(),
			this.model.getRightBuild(),
		);
	}


	private handleSelect(side: "left" | "right"): void {
	const build = 
		side === "left" ? this.model.getLeftBuild() : this.model.getRightBuild();
	if (build === null) return;

	this.onBuildSelected?.(build);
	this.model.advanceTier()
	this.refreshBuilds();
	this.view.showSelection(build);
}

	/**
	 * Get the view
	 */
	getView(): compareScreenView {
		return this.view;
	}
}
