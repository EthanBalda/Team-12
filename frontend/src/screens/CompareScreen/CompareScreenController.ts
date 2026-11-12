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
			(index) => this.handleSelect(index),
			() => onCancel?.(),
		);
	}

	show(): void {
		super.show();
		this.model.pickNewChoices();
		this.view.updateBuilds(this.model.getChoices());
	}

	updateMoney(money: number): void {
		this.view.updateMoney(money);
	}
	/*
	showMessage(message: string): void {
  		this.view.showMessage(message);
	}*/
	private handleSelect(index: number): void {
		const build = this.model.getChoices()[index];
		if (!build) return;
		this.onBuildSelected?.(build);
	}

	reset(): void {
		this.model.reset();
		}

	setTier(tier: number): void {
		this.model.setTier(tier);
	}

	/**
	 * Get the view
	 */
	getView(): compareScreenView {
		return this.view;
	}
}
