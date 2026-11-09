import type { MiniGameResult } from "../types";
import type { Bin, SortItem } from "./items";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY: Record<Difficulty, { items: number; fallMs: number }> = {
    easy: { items: 8, fallMs: 6000 },
    medium: { items: 10, fallMs: 4000 },
    hard: { items: 12, fallMs: 2500 },
};

export const POINTS = 100;
export const STREAK_BONUS = 20;      
export const MAX_STREAK_BONUS = 100;
export const MONEY_PER_POINT = 5;

export interface FallingItem {
    item: SortItem;
    x: number;          
    progress: number;   
}

export interface SortFeedback {
    correct: boolean;
    item: SortItem;
    points: number;
    streak: number;
}

export class SortingModel {
    private items: SortItem[];
    private fallMs: number;
    private random: () => number;

    private index = 0;
    private x = 0.5;
    private progress = 0;
    private held = false;

    private score = 0;
    private streak = 0;
    private bestStreak = 0;
    private correctCount = 0;
    private missedCount = 0;

    constructor(pool: SortItem[], difficulty: Difficulty, random: () => number = Math.random) {
        const settings = DIFFICULTY[difficulty];
        this.random = random;
        this.fallMs = settings.fallMs;
        this.items = shuffle(pool, random).slice(0, settings.items);
        this.x = this.random();
    }

    getCurrent(): FallingItem | null {
        const item = this.items[this.index];
        return item ? { item, x: this.x, progress: this.progress } : null;
    }

    getProgress(): { current: number; total: number } {
        return { current: this.index + 1, total: this.items.length };
    }

    getStats() {
        return {
            score: this.score,
            streak: this.streak,
            bestStreak: this.bestStreak,
            correct: this.correctCount,
            missed: this.missedCount,
        };
    }

    update(ms: number): SortItem | null {
        const current = this.getCurrent();
        if (!current || this.held) return null;

        this.progress += ms / this.fallMs;
        if (this.progress < 1) return null;

        this.missedCount++;
        this.streak = 0;
        this.nextItem();
        return current.item;
    }

    grab(): void {
        if (this.getCurrent()) this.held = true;
    }

    release(x: number, progress: number): void {
        if (!this.held) return;
        this.held = false;
        this.x = clamp(x);
        this.progress = clamp(progress);
    }

    sort(bin: Bin): SortFeedback | null {
        const current = this.getCurrent();
        if (!current) return null;

        const correct = bin === current.item.bin;
        let points = 0;
        if (correct) {
            points = POINTS + Math.min(this.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            this.score += points;
            this.streak++;
            this.correctCount++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
        } else {
            this.streak = 0;
        }

        this.nextItem();
        return { correct, item: current.item, points, streak: this.streak };
    }

    isDone(): boolean {
        return this.index >= this.items.length;
    }

    getResult(): MiniGameResult {
        if (this.items.length === 0) {
            return { delta: {}, summary: "No items to sort" };
        }

        const money = this.score * MONEY_PER_POINT;
        return {
            delta: { money },
            summary: `${this.correctCount}/${this.items.length} sorted, +$${money.toLocaleString("en-US")}`,
        };
    }

    private nextItem(): void {
        this.index++;
        this.progress = 0;
        this.held = false;
        this.x = this.random();
    }
}

function clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
}

function shuffle<T>(items: T[], random: () => number): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
}