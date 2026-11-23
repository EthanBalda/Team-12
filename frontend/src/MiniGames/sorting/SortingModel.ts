import type { MiniGameResult } from "../types";
import type { Bin, SortItem } from "./items";

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY: Record<Difficulty, { items: number; fallMs: number; spawnMs: number; maxActive: number }> = {
    easy:   { items: 8,  fallMs: 6000, spawnMs: 3000, maxActive: 2 },
    medium: { items: 10, fallMs: 4000, spawnMs: 2000, maxActive: 4 },
    hard:   { items: 12, fallMs: 2500, spawnMs: 1200, maxActive: 5 },
};

export const POINTS = 100;
export const STREAK_BONUS = 20;      
export const MAX_STREAK_BONUS = 100;
export const MONEY_PER_POINT = 5;
export const MIN_SPEED = 1;
export const MAX_SPEED = 1.5;

export interface FallingItem {
    id: number;
    item: SortItem;
    x: number;
    progress: number;
    held: boolean;
    speed: number;
}

export interface SortFeedback {
    correct: boolean;
    item: SortItem;
    points: number;
    streak: number;
}

export class SortingModel {
    private queue: SortItem[];
    private active: FallingItem[] = [];
    private total: number;
    private fallMs: number;
    private spawnMs: number;
    private maxActive: number;
    private random: () => number;

    private sinceSpawn = 0;
    private nextId = 0;
    private doneCount = 0;

    private score = 0;
    private streak = 0;
    private bestStreak = 0;
    private correctCount = 0;
    private missedCount = 0;

    constructor(pool: SortItem[], difficulty: Difficulty, random: () => number = Math.random) {
        const settings = DIFFICULTY[difficulty];
        this.random = random;
        this.fallMs = settings.fallMs;
        this.spawnMs = settings.spawnMs;
        this.maxActive = settings.maxActive;
        this.queue = shuffle(pool, random).slice(0, settings.items);
        this.total = this.queue.length;
        if (this.queue.length > 0) this.spawn();
    }

    getActive(): FallingItem[] {
        return this.active;
    }

    getProgress(): { done: number; total: number } {
        return { done: this.doneCount, total: this.total };
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

    update(ms: number): { spawned: FallingItem[]; missed: FallingItem[] } {
        const spawned: FallingItem[] = [];
        const missed: FallingItem[] = [];
        if (this.isDone()) return { spawned, missed };

        for (const falling of this.active) {
            if (!falling.held) falling.progress += (ms / this.fallMs) * falling.speed;
        }

        for (const falling of this.active.filter((f) => f.progress >= 1)) {
            this.remove(falling.id);
            this.missedCount++;
            this.streak = 0;
            missed.push(falling);
        }

        this.sinceSpawn += ms;
        const canSpawn = this.queue.length > 0 && this.active.length < this.maxActive;
        if (canSpawn && (this.active.length === 0 || this.sinceSpawn >= this.spawnMs)) {
            spawned.push(this.spawn());
        }

        return { spawned, missed };
    }

    grab(id: number): void {
        const falling = this.find(id);
        if (falling) falling.held = true;
    }

    release(id: number, x: number, progress: number): void {
        const falling = this.find(id);
        if (!falling || !falling.held) return;
        falling.held = false;
        falling.x = clamp(x);
        falling.progress = Math.max(falling.progress, clamp(progress));
    }

    sort(id: number, bin: Bin): SortFeedback | null {
        const falling = this.find(id);
        if (!falling) return null;

        const correct = bin === falling.item.bin;
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

        this.remove(id);
        return { correct, item: falling.item, points, streak: this.streak };
    }

    isDone(): boolean {
        return this.queue.length === 0 && this.active.length === 0;
    }

    getResult(): MiniGameResult {
        if (this.total === 0) {
            return { delta: {}, summary: "No items to sort" };
        }

        const money = this.score * MONEY_PER_POINT;
        return {
            delta: { money },
            summary: `${this.correctCount}/${this.total} sorted, +$${money.toLocaleString("en-US")}`,
        };
    }

    private spawn(): FallingItem {
        const falling: FallingItem = {
            id: this.nextId++,
            item: this.queue.shift()!,
            x: this.random(),
            progress: 0,
            held: false,
            speed: MIN_SPEED + this.random() * (MAX_SPEED - MIN_SPEED),
        };
        this.active.push(falling);
        this.sinceSpawn = 0;
        return falling;
    }

    private find(id: number): FallingItem | undefined {
        return this.active.find((f) => f.id === id);
    }

    private remove(id: number): void {
        this.active = this.active.filter((f) => f.id !== id);
        this.doneCount++;
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