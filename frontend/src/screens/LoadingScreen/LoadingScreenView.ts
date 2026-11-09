import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

export class LoadingScreenView implements View {
    private group: Konva.Group;

    constructor() {
        this.group = new Konva.Group({ visible: false });

        // Background
        this.group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "#849b8b",
        }));

        // Main title
        this.group.add(new Konva.Text({
            x: 0,
            y: STAGE_HEIGHT / 2 - 80,
            width: STAGE_WIDTH,
            text: "Re:Planet",
            fontSize: 48,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "#14265d",
            align: "center",
        }));

        // Loading message
        this.group.add(new Konva.Text({
            x: 0,
            y: STAGE_HEIGHT / 2,
            width: STAGE_WIDTH,
            text: "Loading your world...",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#ffffff",
            align: "center",
        }));
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