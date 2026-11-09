import { describe, expect, it } from "vitest";
import { TriviaModel } from "../../../../MiniGames/trivia/TriviaModel";
import type { Difficulty, TriviaQuestion } from "../../../../MiniGames/trivia/questions";

function makeQuestion(difficulty: Difficulty): TriviaQuestion {
    return {
        question: `A ${difficulty} question`,
        choices: ["A", "B", "C", "D"],
        answerIndex: 1,
        explanation: "B is correct.",
        difficulty,
    };
}

const QUESTIONS = [makeQuestion("easy"), makeQuestion("medium"), makeQuestion("hard")];

function playRound(model: TriviaModel, correct: boolean): void {
    while (!model.isDone()) {
        const question = model.getCurrentQuestion()!;
        model.answer(correct ? question.answerIndex : question.answerIndex + 1);
        model.next();
    }
}

describe("TriviaModel", () => {
    it.each([
        ["easy", 500],
        ["medium", 1000],
        ["hard", 2000],
    ] as const)("pays the reward for a correct %s answer", (difficulty, reward) => {
        const model = new TriviaModel([makeQuestion(difficulty)]);

        const feedback = model.answer(1);

        expect(feedback).toMatchObject({ correct: true, reward });
    });

    it("pays nothing for a wrong answer", () => {
        const model = new TriviaModel(QUESTIONS);

        const feedback = model.answer(0);

        expect(feedback).toMatchObject({ correct: false, correctIndex: 1, reward: 0 });
    });

    it("only counts the first answer to a question", () => {
        const model = new TriviaModel([makeQuestion("easy")]);

        model.answer(1);

        expect(model.answer(1)).toBeNull();
        model.next();
        expect(model.getResult().delta).toEqual({ money: 500 });
    });

    it("does not move on until the question is answered", () => {
        const model = new TriviaModel(QUESTIONS);
        const first = model.getCurrentQuestion();

        model.next();

        expect(model.getCurrentQuestion()).toBe(first);
    });

    it("adds up the score for a full round", () => {
        const model = new TriviaModel(QUESTIONS);

        playRound(model, true);

        expect(model.getResult()).toEqual({
            delta: { money: 3500 },
            summary: "3/3 correct, +$3,500",
        });
    });

    it("pays nothing when every answer is wrong", () => {
        const model = new TriviaModel(QUESTIONS, 2);

        playRound(model, false);

        expect(model.getResult()).toEqual({
            delta: { money: 0 },
            summary: "0/2 correct, +$0",
        });
    });

    it("ends at once with no reward when there are no questions", () => {
        const model = new TriviaModel([]);

        expect(model.isDone()).toBe(true);
        expect(model.answer(0)).toBeNull();
        expect(model.getResult()).toEqual({ delta: {}, summary: "No questions available" });
    });

    it("plays only as many questions as the set has", () => {
        const model = new TriviaModel(QUESTIONS, 5);

        expect(model.getProgress()).toEqual({ current: 1, total: 3 });
    });

    it("counts progress as the player moves through the round", () => {
        const model = new TriviaModel(QUESTIONS, 2);

        model.answer(1);
        model.next();

        expect(model.getProgress()).toEqual({ current: 2, total: 2 });
    });

    it("picks the same questions every time with the same random function", () => {
        const first = new TriviaModel(QUESTIONS, 2, () => 0);
        const second = new TriviaModel(QUESTIONS, 2, () => 0);

        expect(second.getCurrentQuestion()).toBe(first.getCurrentQuestion());
    });

    it("picks questions without changing the question set", () => {
        const pool = [...QUESTIONS];

        new TriviaModel(pool, 2, () => 0);

        expect(pool).toEqual(QUESTIONS);
    });
});