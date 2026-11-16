import Konva from "konva";
import type { View } from "../../types";
import type { Build } from "../CompareScreen/CompareScreenModel";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

export class ConfirmationScreenView implements View{
    private group: Konva.Group;
    private title: Konva.Text;
    private cost: Konva.Text;
    private moneyLeft: Konva.Text;
    private population: Konva.Text;
    private pollution: Konva.Text;
    private confirmLabel: Konva.Text;
    private buildingImage: Konva.Image;
    private errorText: Konva.Text;

    constructor(onConfirm: () => void = () => {}) {
        this.group = new Konva.Group({visible: false})
        this.group.add(
            new Konva.Rect({
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
                fill: "rgba(0, 0, 0, 0.35)",
            }),
        );

        this.group.add(
            new Konva.Rect({
                x: 250,
                y: 200,
                width: 700,
                height: 400,
                fill: "#FFFDF5",
                stroke: "#E0E4DE",
                strokeWidth: 1,
                cornerRadius: 20,
                shadowColor: "black",
                shadowBlur: 24,
                shadowOpacity: 0.18,
                shadowOffsetY: 8,
            }),
            
        );

        this.title = new Konva.Text({
            x: 250,
            y: 230,
            width: 700,
            text: "Confirm purchase",
            fontSize: 30,
            fontStyle: "bold",
            fill: "#14235D",
            align: "center",
            listening: false,
        });

        this.cost = new Konva.Text({
            x: 550,
            y: 300,
            text: "Cost: —",
            fontSize: 22,
            fill: "#14235D",
        })

        this.moneyLeft = new Konva.Text({
            x: 550,
            y: 345,
            text: "Money after purchase: —",
            fontSize: 22,
            fill: "#14235D",
        });

        this.population = new Konva.Text({
            x: 550,
            y: 390,
            text: "Population: —",
            fontSize: 22,
            fill: "#14235D",
        });

        this.pollution = new Konva.Text({
            x: 550,
            y: 435,
            text: "Pollution: —",
            fontSize: 22,
            fill: "#14235D",
        });

        this.buildingImage = new Konva.Image({
            x: 290,
            y: 310,
            width: 180,
            height: 180,
            image: undefined,
        })

        this.confirmLabel = new Konva.Text({
            width: 280,
            height: 50,
            text: "Confirm",
            fontSize: 22,
            fontStyle: "bold",
            fill: "white",
            align: "center",
            verticalAlign: "middle",
            listening: false,
        });
        this.errorText = new Konva.Text({
            x: 285,
            y: 480,
            width: 630,
            text: "",
            fontSize: 24,
            fontStyle: "bold",
            fill: "#B42318",
            align: "center",
            listening: false,
        });

        

        const cancelButton = new Konva.Group({
            x: 285,
	        y: 520,
        })

        cancelButton.add(
            new Konva.Rect({
                width: 280,
                height: 50,
                fill: "#ECEFF1",
                stroke: "#D0D8E0",
                strokeWidth: 1,
                cornerRadius: 12,
            }),
            new Konva.Text({
                width: 280,
                height: 50,
                text: "Cancel",
                fontSize: 22,
                fontStyle: "bold",
                fill: "#14235D",
                align: "center",
                verticalAlign: "middle",
                listening: false,
            }),
        );

        cancelButton.on("click tap", () => {
            const layer = this.group.getLayer();
            this.group.destroy();
            layer?.batchDraw();
        });

        const confirmButton = new Konva.Group({
            x: 635,
            y: 520,
        });

        confirmButton.add(
            new Konva.Rect({
                width: 280,
                height: 50,
                fill: "#00B5A5",
                cornerRadius: 12,
            }),
            this.confirmLabel,
        );

        confirmButton.on("click tap", () => {
            onConfirm();
        });


        this.group.add(
            this.title,
            this.cost,
            this.moneyLeft,
            this.population,
            this.pollution,
            this.buildingImage,
            this.errorText,
            cancelButton,
            confirmButton,
        )
    }

    setPurchaseDetails(build: Build, currentMoney: number): void {
        const cost = build.money;
        this.title.text(`Build ${build.name}?`);
        this.cost.text(`Cost: $${cost.toLocaleString()}`);
        const remaining = currentMoney - cost;
        this.moneyLeft.text(
            remaining < 0
                ? `You need $${(-remaining).toLocaleString()} more`
                : `Money after purchase: $${remaining.toLocaleString()}`,
        );
this.moneyLeft.fill(remaining < 0 ? "#B42318" : "#14235D");
        const pollution = build.pollution;
        this.pollution.text(`Pollution: ${pollution > 0 ? "+" : ""}${pollution}`);
        this.population.text(
            `Population loss if destroyed: ${build.populationLoss.toLocaleString()}`,
        );

        this.buildingImage.hide();

        const img = new Image();
        img.onload = () => {
            this.buildingImage.image(img);
            this.buildingImage.show();
            this.group.getLayer()?.batchDraw();
        };
        img.src = `/${build.type}.png`;
        this.group.getLayer()?.batchDraw();
    }
    showError(message: string): void {
        this.errorText.text(message);
        this.group.getLayer()?.batchDraw();
    }

    show(): void {
        this.group.show();
        this.group.getLayer()?.batchDraw();
    }

    hide(): void {
        this.group.hide();
        this.group.getLayer()?.batchDraw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }

}