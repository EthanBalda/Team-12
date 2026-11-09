import type { MiniGameResult } from "../types";
import type { Difficulty, TriviaQuestion } from "./questions";

export const REWARDS: Record<Difficulty, number> = {
    easy: 500,
    medium: 1000,
    hard: 2000,
};

export const QUESTIONS_PER_ROUND = 5;

export interface AnswerFeedback {
    correct: boolean;
    correctIndex: number;
    explanation: string;
    reward: number;
}

export class TriviaModel {
    private questions: TriviaQuestion[];
    private index = 0;
    private answered = false;
    private correctCount = 0;
    private money = 0;

    constructor(
        pool: TriviaQuestion[],
        count: number = QUESTIONS_PER_ROUND,
        random: () => number = Math.random,
    ) {
        this.questions = shuffle(pool, random).slice(0, count);
    }

    getCurrentQuestion(): TriviaQuestion | null {
        return this.questions[this.index] ?? null;
    }

    getProgress(): { current: number; total: number } {
        return { current: this.index + 1, total: this.questions.length };
    }

    answer(choiceIndex: number): AnswerFeedback | null {
        const question = this.getCurrentQuestion();
        if (!question || this.answered) return null;
        this.answered = true;

        const correct = choiceIndex === question.answerIndex;
        const reward = correct ? REWARDS[question.difficulty] : 0;
        if (correct) {
            this.correctCount++;
            this.money += reward;
        }

        return {
            correct,
            correctIndex: question.answerIndex,
            explanation: question.explanation,
            reward,
        };
    }

    next(): void {
        if (!this.answered) return;
        this.index++;
        this.answered = false;
    }

    isDone(): boolean {
        return this.index >= this.questions.length;
    }

    getResult(): MiniGameResult {
        if (this.questions.length === 0) {
            return { delta: {}, summary: "No questions available" };
        }

        return {
            delta: { money: this.money },
            summary: `${this.correctCount}/${this.questions.length} correct, +$${this.money.toLocaleString("en-US")}`,
        };
    }
}

function shuffle<T>(items: T[], random: () => number): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
}