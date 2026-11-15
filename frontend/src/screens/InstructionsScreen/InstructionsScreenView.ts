
import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { InstructionsScreenModel } from "./InstructionsScreenModel.ts";

export class InstructionsScreenView {
    private group: Konva.Group;
    private model: InstructionsScreenModel;
    private onGoBack: () => void

    constructor(
        onGoBack: () => void
    ) {
        this.onGoBack = onGoBack;
        
        this.model = new InstructionsScreenModel();

        this.group = new Konva.Group({
            visible: false
        });

        this.createBackground();
        this.createModal();
        this.createHeading();
        this.createInstructions();
        this.createBackButton();

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

    private createHeading(): void {
        const modalX = (STAGE_WIDTH - this.model.modalWidth) / 2;
        const modalY = (STAGE_HEIGHT - this.model.modalHeight) / 2;

        const heading = new Konva.Text({
            x: modalX + 30,
            y: modalY + 40,
            width: this.model.modalWidth - 60,
            text: this.model.title,
            fontSize: 42,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: this.model.colors.primary,
            align: "center"
        });

        const subtext = new Konva.Text({
            x: modalX + 30,
            y: modalY + 90,
            width: this.model.modalWidth - 60,
            text: "Scroll to view all instructions ↓",
            fontSize: 15,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: this.model.colors.secondary,
            align: "center"
        });

        this.group.add(heading);
        this.group.add(subtext);
    }

    private createInstructions(): void {
    const modalX = (STAGE_WIDTH - this.model.modalWidth) / 2;
    const modalY = (STAGE_HEIGHT - this.model.modalHeight) / 2;

    // Dimensions and position of the visible scrolling area
    const viewportX = modalX + 65;
    const viewportY = modalY + 135;
    const viewportWidth = this.model.modalWidth - 130;
    const viewportHeight = 270;

    // Clipped viewport: anything outside this area is hidden
    const viewport = new Konva.Group({
        x: viewportX,
        y: viewportY,
        clip: {
            x: 0,
            y: 0,
            width: viewportWidth,
            height: viewportHeight
        }
    });

    // Group containing the instructions
    const contentGroup = new Konva.Group({
        draggable: true,
        dragBoundFunc: (pos) => {
            const minY = Math.min(
                0,
                viewportHeight - instructions.height()
            );

            return {
                x: viewportX,
                y: Math.max(
                    viewportY + minY,
                    Math.min(viewportY, pos.y)
                )
            };
        }
    });

    const instructions = new Konva.Text({
        x: 0,
        y: 0,
        width: viewportWidth,
        text: this.model.instructions,
        fontSize: 18,
        fontFamily: "Arial",
        fill: this.model.colors.text,
        align: "left",
        verticalAlign: "top",
        lineHeight: 1.5,
        wrap: "word"
    });

    contentGroup.add(instructions);
    viewport.add(contentGroup);

    // Mouse wheel scrolling
    viewport.on("wheel", (event) => {
        event.evt.preventDefault();

        const minY = Math.min(
            0,
            viewportHeight - instructions.height()
        );

        const newY = Math.max(
            minY,
            Math.min(0, contentGroup.y() - event.evt.deltaY)
        );

        contentGroup.y(newY);
    });

    this.group.add(viewport);
    }

    private createBackButton(): void {
        const modalX = (STAGE_WIDTH - this.model.modalWidth) / 2;
        const modalY = (STAGE_HEIGHT - this.model.modalHeight) / 2;

        const buttonGroup = new Konva.Group({
            x: modalX + (this.model.modalWidth - this.model.buttonWidth) / 2,
            y: modalY + 405
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
            text: this.model.backButtonText,
            fontSize: 19,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: this.model.colors.white,
            align: "center",
            verticalAlign: "middle"
        });

        buttonGroup.add(buttonRect);
        buttonGroup.add(buttonText);

        buttonGroup.on("mouseenter", () => {
            buttonRect.fill(this.model.colors.primaryHover);
        });

        buttonGroup.on("mouseleave", () => {
            buttonRect.fill(this.model.colors.primary);
        });

        buttonGroup.on("click tap", this.onGoBack);

        this.group.add(buttonGroup);
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
