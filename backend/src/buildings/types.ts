import type Konva from "konva";

export interface ScreenView {
	show(): void;
	hide(): void;
}

export interface View extends ScreenView {
	getGroup(): Konva.Group;
}

/**
 * Screen types for navigation
 */
export type Screen = { type: "comparison" };

export abstract class ScreenController {
	abstract getView(): ScreenView;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}
