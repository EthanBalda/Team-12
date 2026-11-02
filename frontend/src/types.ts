import type { Group } from "konva/lib/Group";
import type { MinigameId } from "./minigames/registry";

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
    | { type: "mainGame" }
	| { type: "miniGame"; id: MinigameId }
	| { type: "resumeGame"}
	| {type: "result"; success: boolean};

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