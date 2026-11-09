import { describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { TriviaMinigame } from "../../../../MiniGames/trivia/TriviaMinigame";
import { TriviaModel } from "../../../../MiniGames/trivia/TriviaModel";
import type { MiniGameResult } from "../../../../MiniGames/types";

const QUESTION = {
    question: "Which of these is renewable?",
    choices: ["Coal", "Solar", "Oil", "Gas"],
    answerIndex: 1,
    explanation: "Sunlight keeps arriving every day.",
    difficulty: "easy" as const,
};

function startGame(model: TriviaModel) {
    const group = new Konva.Group();
    const finish = vi.fn<(result: MiniGameResult) => void>();
    new TriviaMinigame(model).start({ group, width: 1200, height: 720, finish });
    return { group, finish };
}

function click(group: Konva.Group, label: string): void {
    const text = group.find<Konva.Text>("Text").find((node) => node.text() === label);
    if (!text) throw new Error(`No button labeled "${label}"`);
    text.getParent()!.fire("click");
}

function hasText(group: Konva.Group, value: string): boolean {
    return group.find<Konva.Text>("Text").some((node) => node.text() === value);
}

describe("TriviaMinigame", () => {
    it("shows the explanation and pays the reward after a correct answer", () => {
        const { group, finish } = startGame(new TriviaModel([QUESTION]));

        click(group, "Solar");
        expect(hasText(group, "Correct! +$500")).toBe(true);
        expect(hasText(group, QUESTION.explanation)).toBe(true);

        click(group, "Finish");
        expect(finish).toHaveBeenCalledExactlyOnceWith({
            delta: { money: 500 },
            summary: "1/1 correct, +$500",
        });
    });

    it("ignores clicks on choices after the question is answered", () => {
        const { group, finish } = startGame(new TriviaModel([QUESTION]));

        click(group, "Coal");
        click(group, "Solar");
        click(group, "Finish");

        expect(hasText(group, "Correct! +$500")).toBe(false);
        expect(finish).toHaveBeenCalledExactlyOnceWith({
            delta: { money: 0 },
            summary: "0/1 correct, +$0",
        });
    });

    it("shows the correct answer after a wrong one", () => {
        const { group } = startGame(new TriviaModel([QUESTION]));

        click(group, "Coal");

        expect(hasText(group, 'Wrong. The answer was "Solar".')).toBe(true);
    });

    it("moves to the next question when Next is clicked", () => {
        const second = { ...QUESTION, question: "Second question" };
        const { group, finish } = startGame(new TriviaModel([QUESTION, second], 2, () => 0.99));
        expect(hasText(group, "Question 1 of 2 | Easy")).toBe(true);

        click(group, "Solar");
        click(group, "Next");

        expect(hasText(group, "Question 2 of 2 | Easy")).toBe(true);
        expect(finish).not.toHaveBeenCalled();
    });

    it("lets the player go back to the city when there are no questions", () => {
        const { group, finish } = startGame(new TriviaModel([]));

        click(group, "Back to city");

        expect(finish).toHaveBeenCalledExactlyOnceWith({
            delta: {},
            summary: "No questions available",
        });
    });
});