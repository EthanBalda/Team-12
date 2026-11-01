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
import { compareScreenController } from "compareScreenController.ts";

/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;


	private createWorldController: CreateWorldScreenController;	
    private mainGameController: MainGameScreenController;	

	constructor(container: string) {
		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// Create a layer (screens will be added to this layer)
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Initialize all screen controllers
		// Each controller manages a Model, View, and handles user interactions
		this.createWorldController = new CreateWorldScreenController(this, this.stage.container());
		this.mainGameController = new MainGameScreenController(this);


		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.mainGameController.getView().getGroup());

        
		

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with create world screen visible for now (we might need another screen with like options to create, resume, or view instructions)
		this.createWorldController.getView().show();

	}

	/**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screen: Screen): void {
		// Hide all screens first by setting their Groups to invisible
		this.createWorldController.hide();
		this.mainGameController.hide();

		

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "createWorld":
				this.createWorldController.show();
				break;
            case "mainGame":
				this.mainGameController.startGame();
				break;
		}
	}
}

// Initialize the application
new App("container");