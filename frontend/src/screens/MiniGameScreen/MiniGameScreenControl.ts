import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MINIGAMES, type MiniGameId } from "../../MiniGames/registry.ts";
import type { MiniGame } from "../../MiniGames/MiniGames.ts";
import type { MiniGameResult } from "../../MiniGames/types.ts";
import { MiniGameScreenView } from "./MiniGameScreenView.ts";

export class MiniGameScreenController extends ScreenController {
    private view: MiniGameScreenView;
    private screenSwitcher: ScreenSwitcher;
    private onComplete: (result: MiniGameResult) => void;
    private current: MiniGame | null = null;

    constructor(
        screenSwitcher: ScreenSwitcher,
        onComplete: (result: MiniGameResult) => void,
    ) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.onComplete = onComplete;
        this.view = new MiniGameScreenView(() => this.askToQuit());
    }

    play(id: MiniGameId): void {
        this.stopCurrent();

        const game = MINIGAMES[id]();
        this.current = game;

        this.view.setTitle(game.title);
        this.view.show();

        const { width, height } = this.view.getGameAreaSize();
        game.start({
            group: this.view.getGameArea(),
            width,
            height,
            finish: (result) => {
                this.onComplete(result);
                this.returnToCity();
            },
        });
    }

    // Quitting gives no reward, so the game pauses and the player confirms first.
    private askToQuit(): void {
        if (!this.current) {
            this.returnToCity();
            return;
        }

        this.current.pause();
        this.view.showQuitDialog(
            () => this.returnToCity(),
            () => this.keepPlaying(),
        );
    }

    private keepPlaying(): void {
        this.view.hideQuitDialog();
        this.current?.resume();
    }

    // switchToScreen calls hide(), which destroys the current game
    private returnToCity(): void {
        this.screenSwitcher.switchToScreen({ type: "resumeGame" });
    }

    private stopCurrent(): void {
        this.current?.destroy();
        this.current = null;
        this.view.resetCursor();
    }

    hide(): void {
        this.stopCurrent();
        this.view.hide();
    }

    getView(): MiniGameScreenView {
        return this.view;
    }
}
