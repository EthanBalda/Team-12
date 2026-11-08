import Konva from "konva";
import { Minigame } from "../Minigames";
import { TRIVIA_QUESTIONS } from "./questions";
import { TriviaModel, type AnswerFeedback } from "./TriviaModel";

const COLORS = {
    text: "#101820",
    subtle: "#59636e",
    choice: "#287a55",
    correct: "#2e9e5b",
    wrong: "#c0392b",
    faded: "#9aa5ad",
    next: "#101820",
};

const CHOICE_WIDTH = 460;
const CHOICE_HEIGHT = 90;
const CHOICE_GAP = 30;

export class TriviaMinigame extends Minigame {
    readonly title = "Environmental Trivia";
    private model: TriviaModel;

    constructor(model: TriviaModel = new TriviaModel(TRIVIA_QUESTIONS)) {
        super();
        this.model = model;
    }

    protected setup(): void {
        this.render();
    }

    private render(chosen: number | null = null, feedback: AnswerFeedback | null = null): void {
        this.ctx.group.destroyChildren();
        this.setCursor("default");

        const question = this.model.getCurrentQuestion();
        if (!question) {
            this.renderNoQuestions();
            return;
        }

        const { width } = this.ctx;
        const { current, total } = this.model.getProgress();
        const difficulty = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);

        this.addText(`Question ${current} of ${total} | ${difficulty}`, 30, 20, COLORS.subtle);
        this.addText(question.question, 80, 30, COLORS.text, "bold");

        const gridX = (width - (CHOICE_WIDTH * 2 + CHOICE_GAP)) / 2;
        question.choices.forEach((choice, i) => {
            const x = gridX + (i % 2) * (CHOICE_WIDTH + CHOICE_GAP);
            const y = 230 + Math.floor(i / 2) * (CHOICE_HEIGHT + CHOICE_GAP);

            if (!feedback) {
                this.addButton(choice, x, y, CHOICE_WIDTH, CHOICE_HEIGHT, COLORS.choice, () => {
                    const result = this.model.answer(i);
                    if (result) this.render(i, result);
                });
                return;
            }

            let fill = COLORS.faded;
            if (i === feedback.correctIndex) fill = COLORS.correct;
            else if (i === chosen) fill = COLORS.wrong;
            this.addButton(choice, x, y, CHOICE_WIDTH, CHOICE_HEIGHT, fill);
        });

        if (feedback) {
            const message = feedback.correct
                ? `Correct! +$${feedback.reward.toLocaleString("en-US")}`
                : `Wrong. The answer was "${question.choices[feedback.correctIndex]}".`;
            this.addText(message, 480, 26, feedback.correct ? COLORS.correct : COLORS.wrong, "bold");
            this.addText(feedback.explanation, 525, 20, COLORS.text);

            const label = current === total ? "Finish" : "Next";
            this.addButton(label, (width - 220) / 2, 610, 220, 60, COLORS.next, () => this.nextQuestion());
        }

        this.redraw();
    }

    private nextQuestion(): void {
        this.model.next();
        if (this.model.isDone()) {
            this.finish(this.model.getResult());
        } else {
            this.render();
        }
    }

    /** Lets the player leave safely if the question set is empty. */
    private renderNoQuestions(): void {
        this.addText("No questions available right now.", 250, 30, COLORS.text, "bold");
        this.addButton("Back to city", (this.ctx.width - 220) / 2, 340, 220, 60, COLORS.next, () => {
            this.finish(this.model.getResult());
        });
        this.redraw();
    }

    private addText(text: string, y: number, fontSize: number, fill: string, fontStyle = "normal"): void {
        this.ctx.group.add(new Konva.Text({
            x: 100,
            y,
            width: this.ctx.width - 200,
            text,
            fontSize,
            fontFamily: "Arial",
            fontStyle,
            fill,
            align: "center",
        }));
    }

    private addButton(
        label: string,
        x: number,
        y: number,
        width: number,
        height: number,
        fill: string,
        onClick?: () => void,
    ): void {
        const button = new Konva.Group({ x, y });

        button.add(new Konva.Rect({ width, height, fill, cornerRadius: 10 }));
        button.add(new Konva.Text({
            width,
            height,
            padding: 12,
            text: label,
            fontSize: 22,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "white",
            align: "center",
            verticalAlign: "middle",
        }));

        if (onClick) {
            button.on("click tap", onClick);
            button.on("mouseenter", () => this.setCursor("pointer"));
            button.on("mouseleave", () => this.setCursor("default"));
        }

        this.ctx.group.add(button);
    }

    private setCursor(cursor: string): void {
        const container = this.ctx.group.getStage()?.container();
        if (container) container.style.cursor = cursor;
    }
}