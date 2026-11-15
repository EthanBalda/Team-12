import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

const BAR_HEIGHT = 80;
const DIALOG_WIDTH = 460;
const DIALOG_HEIGHT = 230;

export class MiniGameScreenView implements View {
    private group: Konva.Group;
    private gameArea: Konva.Group;
    private titleText: Konva.Text;
    private quitDialog: Konva.Group;
    private onConfirmQuit: (() => void) | null = null;
    private onCancelQuit: (() => void) | null = null;

    constructor(onQuit: () => void) {
        this.group = new Konva.Group({ visible: false });

        this.group.add(new Konva.Rect({
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#e8efe9",
        }));

        // top bar
        this.group.add(new Konva.Rect({
            width: STAGE_WIDTH,
            height: BAR_HEIGHT,
            fill: "#101820",
        }));

        this.titleText = new Konva.Text({
            x: 30,
            y: 0,
            height: BAR_HEIGHT,
            text: "",
            fontSize: 28,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "white",
            verticalAlign: "middle",
        });
        this.group.add(this.titleText);

        this.addButton("Quit", STAGE_WIDTH - 150, 15, 120, 50, "#59636e", onQuit);

        // the minigame draws in here; positions inside are relative to below the bar
        this.gameArea = new Konva.Group({ y: BAR_HEIGHT });
        this.group.add(this.gameArea);

        // drawn last so it covers the game and blocks clicks on it
        this.quitDialog = this.createQuitDialog();
        this.group.add(this.quitDialog);
    }

    setTitle(title: string): void {
        this.titleText.text(title);
    }

    getGameArea(): Konva.Group {
        return this.gameArea;
    }

    getGameAreaSize(): { width: number; height: number } {
        return { width: STAGE_WIDTH, height: STAGE_HEIGHT - BAR_HEIGHT };
    }

    showQuitDialog(onConfirm: () => void, onCancel: () => void): void {
        this.onConfirmQuit = onConfirm;
        this.onCancelQuit = onCancel;
        this.quitDialog.visible(true);
        this.group.getLayer()?.draw();
    }

    hideQuitDialog(): void {
        this.onConfirmQuit = null;
        this.onCancelQuit = null;
        this.quitDialog.visible(false);
        this.group.getLayer()?.draw();
    }

    private createQuitDialog(): Konva.Group {
        const dialog = new Konva.Group({ visible: false });
        const x = (STAGE_WIDTH - DIALOG_WIDTH) / 2;
        const y = (STAGE_HEIGHT - DIALOG_HEIGHT) / 2;

        dialog.add(new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "black", opacity: 0.55 }));
        dialog.add(new Konva.Rect({ x, y, width: DIALOG_WIDTH, height: DIALOG_HEIGHT, fill: "white", cornerRadius: 14 }));
        dialog.add(new Konva.Text({
            x,
            y: y + 40,
            width: DIALOG_WIDTH,
            text: "Leave this minigame?",
            fontSize: 28,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "#101820",
            align: "center",
        }));
        dialog.add(new Konva.Text({
            x,
            y: y + 85,
            width: DIALOG_WIDTH,
            text: "You won't get a reward.",
            fontSize: 20,
            fontFamily: "Arial",
            fill: "#59636e",
            align: "center",
        }));

        this.addButton("Keep playing", x + 40, y + 140, 180, 55, "#287a55", () => this.onCancelQuit?.(), dialog);
        this.addButton("Leave", x + DIALOG_WIDTH - 220, y + 140, 180, 55, "#c0392b", () => this.onConfirmQuit?.(), dialog);

        return dialog;
    }

    /** Minigame buttons may leave a pointer cursor behind when destroyed. */
    resetCursor(): void {
        this.group.getStage()?.container().style.setProperty("cursor", "default");
    }

    private addButton(
        label: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        onClick: () => void,
        parent: Konva.Group = this.group,
    ): void {
        const button = new Konva.Group({ x, y });

        button.add(new Konva.Rect({ width, height, fill: color, cornerRadius: 10 }));
        button.add(new Konva.Text({
            width,
            height,
            text: label,
            fontSize: 19,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "white",
            align: "center",
            verticalAlign: "middle",
        }));

        button.on("click tap", onClick);
        parent.add(button);
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    hide(): void {
        this.hideQuitDialog();
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
