import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { CreateWorldScreenController } from "./screens/CreateWorldScreen/CreateWorldScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { MainGameScreenController } from "./screens/MainGameScreen/MainGameScreenController.ts";
import { MiniGameScreenController } from "./screens/MiniGameScreen/MiniGameScreenControl.ts";
import { ResultScreenController } from "./screens/ResultScreen/ResultScreenController.ts";
import { compareScreenController } from "./screens/CompareScreen/CompareScreenController.ts";
import { LoginWorldScreenController } from "./screens/LoginWorldScreen/LoginWorldScreenController.ts";
import { checkLogin } from "./auth.ts";
import { LoadingScreenController } from "./screens/LoadingScreen/LoadingScreenController.ts";
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
	private miniGameController: MiniGameScreenController;
	private resultScreenController: ResultScreenController;
	private loginWorldController: LoginWorldScreenController;
	private compareScreenController: compareScreenController;
	private loadingController: LoadingScreenController;

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
		this.loginWorldController = new LoginWorldScreenController(this, this.stage.container());
		this.mainGameController = new MainGameScreenController(this);
		this.miniGameController = new MiniGameScreenController(
			this,
			(result) => this.mainGameController.applyMiniGameResult(result),
		);
		this.layer.add(this.miniGameController.getView().getGroup());
		this.resultScreenController = new ResultScreenController(this);
		this.loadingController = new LoadingScreenController();

		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.mainGameController.getView().getGroup());
		this.layer.add(this.resultScreenController.getView().getGroup());

        this.compareScreenController = new compareScreenController(this);
		this.layer.add(this.compareScreenController.getView().getGroup());
		this.layer.add(this.loadingController.getView().getGroup());
		
		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with create world screen visible for now (we might need another screen with like options to create, resume, or view instructions)
		
		
		void this.initialize();
	}

	/**
	 * Intializes the correct screen based on authentication
	 */

	private async initialize(): Promise<void> {
		
		this.switchToScreen({ type: "loading" });
		
    	const loggedIn = await checkLogin();

		if(loggedIn){
			this.switchToScreen({ type: "loadGame" });
		} 
		else{
			this.switchToScreen({ type: "createWorld" });
		}

    	this.layer.draw();
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
		this.loginWorldController.hide();
		this.mainGameController.hide();
		this.miniGameController.hide();
		this.resultScreenController.hide();
		this.compareScreenController.getView().hide();
		this.loadingController.hide();
		

		// Show the requested screen based on the screen type
		switch (screen.type) {
			case "createWorld":
				this.createWorldController.show();
				break;
			case "loginWorld":
				this.loginWorldController.show();
				break;
            case "mainGame":
				this.mainGameController.startGame(true);
				break;
            case "loadGame":
                void this.mainGameController.loadGame();
                break;
			case "miniGame":
				this.miniGameController.play(screen.id);
				break;
			case "resumeGame":
				this.mainGameController.show();
				break;
			case "result":
				this.resultScreenController.showResult(screen.success);
				break;
			case "comparison":
				this.compareScreenController.show();
				break;
			case "loading":
    			this.loadingController.show();
    			break;
		}
	}
}

// Initialize the application
new App("container");