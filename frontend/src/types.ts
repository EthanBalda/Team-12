import type { Group } from "konva/lib/Group";

export interface ScreenView {
  show(): void;
  hide(): void;
}

export interface View extends ScreenView{
	getGroup(): Group;
}

/**
 * Screen types for navigation
 *
 * - "createWorld": CreateWorld screen
 * 
 */
export type Screen =
	| { type: "createWorld" }
    | { type: "mainGame" };

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