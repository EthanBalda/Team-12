export interface HighScoreStore {
    get(): number;
    save(score: number): void;
}

export class LocalHighScoreStore implements HighScoreStore {
    private key: string;

    constructor(key: string = "sortingHighScore") {
        this.key = key;
    }

    get(): number {
        try {
            const value = Number(window.localStorage.getItem(this.key));
            return Number.isFinite(value) ? value : 0;
        } catch {
            return 0;
        }
    }

    save(score: number): void {
        try {
            window.localStorage.setItem(this.key, String(score));
        } catch {
        }
    }
}

export function recordHighScore(store: HighScoreStore, score: number): { best: number; isNew: boolean } {
    const previous = store.get();
    if (score > previous) {
        store.save(score);
        return { best: score, isNew: true };
    }
    return { best: previous, isNew: false };
}
