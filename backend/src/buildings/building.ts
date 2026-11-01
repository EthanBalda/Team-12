/*
As a mayor, I want to compare building costs and effects on money, happiness, population, and pollution so that I can make informed building decisions.
Create a menu that displays available buildings, their costs, and the effects it’ll have on the city
-Displays 2 at a time grabbed from the JSON file 
-Implement functionality to update the city’s statistics when a building is purchased
-Setters and getters
Write tests to verify that the building costs and effects are displayed and applied correctly

As a mayor, I want to unlock new buildings as my population grows and upgrade existing buildings so that I can develop my city.
Define progression boundaries, upgrades to costs and effects
-Yearly.
Implement unlock progression and validated upgrade transactions
-Improve stats by percentage
Add progress, unlock, and upgrade feedback to the city interface
-Notification message
Write tests for population decline, locked upgrades, and obtainability
-Decline should lock up things again
-Cannot access locked ones
Run and pass tests, debug failures and manually check tier progression
*/

import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { compareScreenController } from "./compareScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";

/**
 * Main Application - Coordinates all screens
 *
 * Each screen has its own Konva.Group that can be shown or hidden
 * independently. All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private compareController: compareScreenController;

	constructor(container: string) {
		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.compareController = new compareScreenController(this, (build) => {
			console.log("Selected ", build);
		});

		// Add all screen groups to the layer
		this.layer.add(this.compareController.getView().getGroup());

		// Start on the comparison screen
		this.switchToScreen({ type: "comparison" });
		this.layer.draw();
	}

	/**
	 * Switch to a different screen: hide everything, then show the requested one.
	 */
	switchToScreen(screen: Screen): void {
		this.compareController.hide();

		switch (screen.type) {
			case "comparison":
				this.compareController.show();
				break;
		}
	}
}

// Initialize the application
new App("container");
