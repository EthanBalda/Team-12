import { describe, expect, it } from "vitest";
import { TRIVIA_QUESTIONS } from "../../../../MiniGames/trivia/questions";
import { QUESTIONS_PER_ROUND } from "../../../../MiniGames/trivia/TriviaModel";

describe("TRIVIA_QUESTIONS", () => {
    it("has enough questions for a full round", () => {
        expect(TRIVIA_QUESTIONS.length).toBeGreaterThanOrEqual(QUESTIONS_PER_ROUND);
    });

    it.each(TRIVIA_QUESTIONS.map((q) => [q.question, q] as const))(
        "has 4 choices, a valid answer, and an explanation: %s",
        (_, question) => {
            expect(question.choices).toHaveLength(4);
            expect(question.answerIndex).toBeGreaterThanOrEqual(0);
            expect(question.answerIndex).toBeLessThan(question.choices.length);
            expect(question.explanation.trim()).not.toBe("");
        },
    );

    it("has no repeated questions", () => {
        const texts = TRIVIA_QUESTIONS.map((q) => q.question);

        expect(new Set(texts).size).toBe(texts.length);
    });

    it("includes every difficulty", () => {
        const difficulties = new Set(TRIVIA_QUESTIONS.map((q) => q.difficulty));

        expect([...difficulties].sort()).toEqual(["easy", "hard", "medium"]);
    });
});