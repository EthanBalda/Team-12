import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { compareScreenModel, type Build } from "./CompareScreenModel";
import { compareScreenView } from "./CompareScreenView";

/**
 * compareScreenController - Handles interactions necessary for comparison
 */
export class compareScreenController extends ScreenController {
	private model: compareScreenModel;
	private view: compareScreenView;
	protected screenSwitcher: ScreenSwitcher;
	private onBuildSelected: ((build: Build) => boolean) | undefined;

	constructor(
		screenSwitcher: ScreenSwitcher,
		onBuildSelected?: (build: Build) => boolean,
		onCancel?: () => void,
	) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.onBuildSelected = onBuildSelected;
		this.model = new compareScreenModel();
		this.view = new compareScreenView(
			() => this.handleSelect("left"),
			() => this.handleSelect("right"),
			() => onCancel?.(),
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

	reset(): void {
		this.model.reset();
		}

	setTier(tier: number): void {
		this.model.setTier(tier);
	}

	private handleSelect(side: "left" | "right"): void {
		const build =
			side === "left" ? this.model.getLeftBuild() : this.model.getRightBuild();
		if (build === null) return;

		this.onBuildSelected?.(build);
	}

	/**
	 * Get the view
	 */
	getView(): compareScreenView {
		return this.view;
	}
}
