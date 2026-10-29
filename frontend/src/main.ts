import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { CreateWorldScreenController } from "./screens/CreateWorldScreen/CreateWorldScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { MainGameScreenController } from "./screens/MainGameScreen/MainGameScreenController.ts";

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