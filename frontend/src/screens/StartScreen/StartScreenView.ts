
import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { StartScreenModel } from "./StartScreenModel.ts";

export class StartScreenView {
    private group: Konva.Group;
    private model: StartScreenModel;
    private onStartNewGame: () => void;
    private onContinueGame: () => void;
    private onHowToPlay: () => void;
    constructor(
        onStartNewGame: () => void,
        onContinueGame: () => void,
        onHowToPlay: () => void
    ) {
        this.onStartNewGame = onStartNewGame;
        this.onContinueGame = onContinueGame;
        this.onHowToPlay = onHowToPlay;

        this.model = new StartScreenModel();

        this.group = new Konva.Group({
            visible: false
        });

        this.createBackground();
        this.createModal();
        this.createHeadings();
        this.createButtons();
    }

    private createBackground(): void {
        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: this.model.colors.background
        });

        this.group.add(background);
    }

    private createModal(): void {
        const modal = new Konva.Rect({
            x: (STAGE_WIDTH - this.model.modalWidth) / 2,
            y: (STAGE_HEIGHT - this.model.modalHeight) / 2,
            width: this.model.modalWidth,
            height: this.model.modalHeight,
            fill: this.model.colors.modal,
            cornerRadius: 24,
            shadowColor: "black",
            shadowBlur: 25,
            shadowOffset: { x: 0, y: 8 },
            shadowOpacity: 0.2
        });

        this.group.add(modal);
    }

    private createHeadings(): void {
        const modalX = (STAGE_WIDTH - this.model.modalWidth) / 2;
        const modalY = (STAGE_HEIGHT - this.model.modalHeight) / 2;

        // H1: Re:Planet
        const title = new Konva.Text({
            x: modalX + 30,
            y: modalY + 45,
            width: this.model.modalWidth - 60,
            text: this.model.title,
            fontSize: 64,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: this.model.colors.primary,
            align: "center"
        });

        // H2: Build a new home
        const subtitle = new Konva.Text({
            x: modalX + 30,
            y: modalY + 135,
            width: this.model.modalWidth - 60,
            text: this.model.subtitle,
            fontSize: 30,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: this.model.colors.secondary,
            align: "center"
        });

        // H3: Learn about climate change
        const description = new Konva.Text({
            x: modalX + 30,
            y: modalY + 190,
            width: this.model.modalWidth - 60,
            text: this.model.description,
            fontSize: 19,
            fontFamily: "Arial",
            fill: this.model.colors.text,
            align: "center"
        });

        this.group.add(title);
        this.group.add(subtitle);
        this.group.add(description);
    }

    private createButtons(): void {
        const modalX = (STAGE_WIDTH - this.model.modalWidth) / 2;
        const modalY = (STAGE_HEIGHT - this.model.modalHeight) / 2;

        const buttonCallbacks = [
            this.onStartNewGame,
            this.onContinueGame,
            this.onHowToPlay
        ];

        this.model.buttons.forEach((label, index) => {
            const buttonGroup = new Konva.Group({
                x: modalX + (this.model.modalWidth - this.model.buttonWidth) / 2,
                y: modalY + 275 + index * (
                    this.model.buttonHeight + this.model.buttonGap
                )
            });

            const buttonRect = new Konva.Rect({
                width: this.model.buttonWidth,
                height: this.model.buttonHeight,
                fill: this.model.colors.primary,
                cornerRadius: 13
            });

            const buttonText = new Konva.Text({
                x: 0,
                y: 0,
                width: this.model.buttonWidth,
                height: this.model.buttonHeight,
                text: label,
                fontSize: 19,
                fontFamily: "Arial",
                fontStyle: "bold",
                fill: this.model.colors.white,
                align: "center",
                verticalAlign: "middle"
            });

            buttonGroup.add(buttonRect);
            buttonGroup.add(buttonText);

            // Hover effects
            buttonGroup.on("mouseenter", () => {
                buttonRect.fill(this.model.colors.primaryHover);
            });

            buttonGroup.on("mouseleave", () => {
                buttonRect.fill(this.model.colors.primary);
            });

            // Click and touch events
            buttonGroup.on("click tap", buttonCallbacks[index]);

            this.group.add(buttonGroup);
        });
    }

    getGroup(): Konva.Group {
        return this.group;
    }

    show(): void {
        this.group.visible(true);
    }

    hide(): void {
        this.group.visible(false);
    }
}
