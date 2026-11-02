import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

const BAR_HEIGHT = 80;

export class MiniGameScreenView implements View {
    private group: Konva.Group;
    private gameArea: Konva.Group;
    private titleText: Konva.Text;

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
        this.group.add(button);
    }

    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
