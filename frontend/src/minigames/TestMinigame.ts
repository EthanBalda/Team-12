import Konva from "konva";
import { MiniGame } from "./MiniGames";

export class TestMiniGame extends MiniGame{
    readonly title : string = "Test Game"

    protected setup(): void {
        const width = 240;
        const height = 70;

        const button = new Konva.Group({
            x: (this.ctx.width - width) / 2,
            y: (this.ctx.height - height) / 2,
        });

        button.add(new Konva.Rect({
            width,
            height,
            fill: "#287a55",
            cornerRadius: 10,
        }));

        button.add(new Konva.Text({
            width,
            height,
            text: "Win $1,000",
            fontSize: 20,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "white",
            align: "center",
            verticalAlign: "middle",
        }));

        button.on("click tap", () => {
            this.finish({ delta: { money: 1000 }, summary: "+$1,000" });
        });

        this.ctx.group.add(button);
    }
}