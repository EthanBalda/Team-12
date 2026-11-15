import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";

import { CreateWorldScreenController } from "./screens/CreateWorldScreen/CreateWorldScreenController.ts";
import { LoginWorldScreenController } from "./screens/LoginWorldScreen/LoginWorldScreenController.ts";

import { StartScreenController } from "./screens/StartScreen/StartScreenController.ts";
import { InstructionsScreenController } from "./screens/InstructionsScreen/InstructionsScreenController.ts";

import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";

import { MainGameScreenController } from "./screens/MainGameScreen/MainGameScreenController.ts";
import { MiniGameScreenController } from "./screens/MiniGameScreen/MiniGameScreenControl.ts";
import { ResultScreenController } from "./screens/ResultScreen/ResultScreenController.ts";
import { compareScreenController } from "./screens/CompareScreen/CompareScreenController.ts";

import { checkLogin } from "./auth.ts";
import { LoadingScreenController } from "./screens/LoadingScreen/LoadingScreenController.ts";

class App implements ScreenSwitcher {
    private stage: Konva.Stage;
    private layer: Konva.Layer;

    private createWorldController: CreateWorldScreenController;
    private loginWorldController: LoginWorldScreenController;

    private startScreenController: StartScreenController;
    private instructionsScreenController: InstructionsScreenController;

    private mainGameController: MainGameScreenController;
    private miniGameController: MiniGameScreenController;
    private resultScreenController: ResultScreenController;
    private compareScreenController: compareScreenController;
    private loadingController: LoadingScreenController;

    constructor(container: string) {
        // Initialize Konva stage
        this.stage = new Konva.Stage({
            container,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT
        });

        // Create layer
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Initialize controllers
        this.createWorldController = new CreateWorldScreenController(
            this,
            this.stage.container()
        );

        this.loginWorldController = new LoginWorldScreenController(
            this,
            this.stage.container()
        );

        this.startScreenController = new StartScreenController(this);

        this.instructionsScreenController =
            new InstructionsScreenController(this);

        this.mainGameController = new MainGameScreenController(this);

        this.miniGameController = new MiniGameScreenController(
            this,
            (result) => this.mainGameController.applyMiniGameResult(result)
        );

        this.resultScreenController = new ResultScreenController(this);

        this.compareScreenController = new compareScreenController(this);

        this.loadingController = new LoadingScreenController();

        // Add Konva screen groups to the layer
        this.layer.add(
            this.startScreenController.getView().getGroup()
        );

        this.layer.add(
            this.instructionsScreenController.getView().getGroup()
        );

        this.layer.add(
            this.miniGameController.getView().getGroup()
        );

        this.layer.add(
            this.mainGameController.getView().getGroup()
        );

        this.layer.add(
            this.resultScreenController.getView().getGroup()
        );

        this.layer.add(
            this.compareScreenController.getView().getGroup()
        );

        this.layer.add(
            this.loadingController.getView().getGroup()
        );

        this.layer.draw();

        // Initialize the correct screen
        void this.initialize();
    }

    /**
     * Initializes the correct screen based on authentication.
     */
    private async initialize(): Promise<void> {
    this.switchToScreen({ type: "loading" });

    const loggedIn = await checkLogin();

    if (loggedIn) {
        this.switchToScreen({ type: "loadGame" });
    } else {
        this.switchToScreen({ type: "start" });
    }

    this.layer.draw();
	}

    /**
     * Switches between application screens.
     */
    switchToScreen(screen: Screen): void {
        // Hide all screens
        this.startScreenController.hide();
        this.instructionsScreenController.hide();

        this.createWorldController.hide();
        this.loginWorldController.hide();

        this.mainGameController.hide();
        this.miniGameController.hide();
        this.resultScreenController.hide();

        this.compareScreenController.getView().hide();

        this.loadingController.hide();

        // Show requested screen
        switch (screen.type) {
            case "start":
                this.startScreenController.show();
                break;

            case "instructions":
                this.instructionsScreenController.show();
                break;

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

        this.layer.draw();
    }
}

// Initialize application
new App("container");
