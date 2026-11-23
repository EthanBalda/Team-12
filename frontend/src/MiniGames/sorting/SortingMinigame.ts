
import Konva from "konva";
import { MiniGame } from "../MiniGames";
import { BINS, SORT_ITEMS, type Bin, type SortItem } from "./items";
import { SortingModel, type Difficulty, type FallingItem } from "./SortingModel";
import { LocalHighScoreStore, recordHighScore, type HighScoreStore } from "./highScore";

const COLORS = {
    text: "#101820",
    subtle: "#59636e",
    button: "#101820",
    correct: "#2e9e5b",
    wrong: "#c0392b",
    item: "#ffffff",
};

const BIN_STYLE: Record<Bin, { label: string; color: string }> = {
    recycling: { label: "Recycling", color: "#2f6db5" },
    compost: { label: "Compost", color: "#2e9e5b" },
    trash: { label: "Trash", color: "#59636e" },
};

const BIN_WIDTH = 280;
const BIN_HEIGHT = 150;
const BIN_GAP = 60;
const ITEM_WIDTH = 190;
const ITEM_HEIGHT = 56;
const FALL_TOP = 100;       
const MAX_FRAME_MS = 100;   

interface BinArea {
    bin: Bin;
    x: number;
    y: number;
}

export interface SortingOptions {
    items?: SortItem[];
    store?: HighScoreStore;
    random?: () => number;
}

export class SortingMinigame extends MiniGame {
    readonly title = "Trash Sorting";

    private items: SortItem[];
    private store: HighScoreStore;
    private random: () => number;

    private model: SortingModel | null = null;
    private animation: Konva.Animation | null = null;
    private binAreas: BinArea[] = [];
    private itemNodes = new Map<number, Konva.Group>();
    private statusText: Konva.Text | null = null;
    private feedbackText: Konva.Text | null = null;

    constructor(options: SortingOptions = {}) {
        super();
        this.items = options.items ?? SORT_ITEMS;
        this.store = options.store ?? new LocalHighScoreStore();
        this.random = options.random ?? Math.random;
    }

    protected setup(): void {
        this.renderDifficultyPicker();
    }

    private renderDifficultyPicker(): void {
        this.clear();
        this.addText("Pick a difficulty", 150, 34, COLORS.text, "bold");
        this.addText("Sort each item before it reaches the bins. More will keep falling!", 205, 22, COLORS.subtle);

        const levels: Difficulty[] = ["easy", "medium", "hard"];
        const startX = (this.ctx.width - (levels.length * 220 + (levels.length - 1) * 30)) / 2;
        levels.forEach((level, i) => {
            const label = level.charAt(0).toUpperCase() + level.slice(1);
            this.addButton(label, startX + i * 250, 300, 220, 70, COLORS.button, () => this.startRound(level));
        });

        this.redraw();
    }

    private startRound(difficulty: Difficulty): void {
        this.model = new SortingModel(this.items, difficulty, this.random);
        if (this.model.isDone()) {
            this.renderEnd();
            return;
        }

        this.clear();
        this.drawBins();
        this.statusText = this.addText("", 20, 20, COLORS.subtle);
        this.feedbackText = this.addText("", 55, 22, COLORS.text, "bold");
        this.syncItems();
        this.updateStatus();

        this.animation = this.addAnimation((frame) => {
            this.onFrame(Math.min(frame.timeDiff, MAX_FRAME_MS));
        });
    }

    private onFrame(ms: number): void {
        if (!this.model) return;

        const { missed } = this.model.update(ms);
        for (const falling of missed) this.showFeedback(`Missed! ${falling.item.tip}`, COLORS.wrong);
        if (missed.length > 0) this.updateStatus();

        if (this.model.isDone()) {
            this.renderEnd();
            return;
        }
        this.syncItems();
    }

    private syncItems(): void {
        if (!this.model) return;

        const active = this.model.getActive();
        const ids = new Set(active.map((falling) => falling.id));
        for (const [id, node] of this.itemNodes) {
            if (!ids.has(id)) {
                node.destroy();
                this.itemNodes.delete(id);
            }
        }

        for (const falling of active) {
            const node = this.itemNodes.get(falling.id) ?? this.drawItem(falling);
            if (!node.isDragging()) {
                node.position({
                    x: falling.x * this.maxX(),
                    y: FALL_TOP + falling.progress * this.fallDistance(),
                });
            }
        }
        this.redraw();
    }

    private drawBins(): void {
        const y = this.ctx.height - BIN_HEIGHT - 20;
        const startX = (this.ctx.width - (BINS.length * BIN_WIDTH + (BINS.length - 1) * BIN_GAP)) / 2;

        this.binAreas = BINS.map((bin, i) => {
            const x = startX + i * (BIN_WIDTH + BIN_GAP);
            const { label, color } = BIN_STYLE[bin];

            this.ctx.group.add(new Konva.Rect({ x, y, width: BIN_WIDTH, height: BIN_HEIGHT, fill: color, cornerRadius: 12 }));
            this.ctx.group.add(new Konva.Text({
                x,
                y,
                width: BIN_WIDTH,
                height: BIN_HEIGHT,
                text: label,
                fontSize: 26,
                fontFamily: "Arial",
                fontStyle: "bold",
                fill: "white",
                align: "center",
                verticalAlign: "middle",
            }));

            return { bin, x, y };
        });
    }

    private drawItem(falling: FallingItem): Konva.Group {
        const node = new Konva.Group({ draggable: true });
        node.add(new Konva.Rect({
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            fill: COLORS.item,
            stroke: COLORS.text,
            strokeWidth: 2,
            cornerRadius: 10,
        }));
        node.add(new Konva.Text({
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            text: falling.item.name,
            fontSize: 20,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: COLORS.text,
            align: "center",
            verticalAlign: "middle",
        }));

        node.on("mouseenter", () => this.setCursor("grab"));
        node.on("mouseleave", () => this.setCursor("default"));
        let minY = 0;
        node.on("dragstart", () => {
            minY = node.y();
            this.setCursor("grabbing");
            node.moveToTop();
            this.model?.grab(falling.id);
        });
        node.on("dragmove", () => {
            this.keepInside(node, minY);
            minY = node.y();
        });
        node.on("dragend", () => {
            this.setCursor("grab");
            this.drop(falling.id, node);
        });

        this.ctx.group.add(node);
        this.itemNodes.set(falling.id, node);
        return node;
    }

    private drop(id: number, node: Konva.Group): void {
        if (!this.model) return;

        const centerX = node.x() + ITEM_WIDTH / 2;
        const centerY = node.y() + ITEM_HEIGHT / 2;
        const area = this.binAreas.find((a) =>
            centerX >= a.x && centerX <= a.x + BIN_WIDTH && centerY >= a.y && centerY <= a.y + BIN_HEIGHT,
        );

        if (!area) {
            this.model.release(id, node.x() / this.maxX(), (node.y() - FALL_TOP) / this.fallDistance());
            return;
        }

        const feedback = this.model.sort(id, area.bin);
        if (!feedback) return;

        if (feedback.correct) {
            this.showFeedback(`Correct! +${feedback.points}. ${feedback.item.tip}`, COLORS.correct);
        } else {
            this.showFeedback(`Wrong bin. ${feedback.item.tip}`, COLORS.wrong);
        }
        this.updateStatus();

        if (this.model.isDone()) {
            this.renderEnd();
        } else {
            this.syncItems();
        }
    }

    private updateStatus(): void {
        if (!this.model || !this.statusText) return;

        const { done, total } = this.model.getProgress();
        const { score, streak } = this.model.getStats();
        this.statusText.text(`Sorted ${done} of ${total} | Score ${score} | Streak ${streak}`);
    }

    private keepInside(node: Konva.Group, minY : number): void {
        node.x(Math.min(Math.max(node.x(), 0), this.maxX()));
        node.y(Math.min(Math.max(node.y(), minY), this.ctx.height - ITEM_HEIGHT));
    }

    private renderEnd(): void {
        this.animation?.stop();
        this.clear();

        const model = this.model;
        if (!model || model.getProgress().total === 0) {
            this.addText("No items to sort right now.", 250, 30, COLORS.text, "bold");
        } else {
            const { score, bestStreak, correct, missed } = model.getStats();
            const { total } = model.getProgress();
            const { best, isNew } = recordHighScore(this.store, score);
            const money = model.getResult().delta.money ?? 0;

            this.addText("Round over", 110, 36, COLORS.text, "bold");
            this.addText(`Sorted correctly: ${correct} of ${total}`, 180, 24, COLORS.text);
            this.addText(`Missed: ${missed}`, 220, 24, COLORS.text);
            this.addText(`Best streak: ${bestStreak}`, 260, 24, COLORS.text);
            this.addText(`Score: ${score}`, 300, 24, COLORS.text);
            this.addText(isNew ? `New high score: ${best}!` : `High score: ${best}`, 340, 24, isNew ? COLORS.correct : COLORS.text, "bold");
            this.addText(`Reward: +$${money.toLocaleString("en-US")}`, 390, 28, COLORS.correct, "bold");
        }

        this.addButton("Back to city", (this.ctx.width - 220) / 2, 470, 220, 60, COLORS.button, () => {
            this.finish(model ? model.getResult() : { delta: {}, summary: "No items to sort" });
        });
        this.redraw();
    }

    private showFeedback(message: string, color: string): void {
        this.feedbackText?.text(message);
        this.feedbackText?.fill(color);
    }

    private clear(): void {
        this.ctx.group.destroyChildren();
        this.itemNodes.clear();
        this.statusText = null;
        this.feedbackText = null;
        this.setCursor("default");
    }

    private maxX(): number {
        return this.ctx.width - ITEM_WIDTH;
    }

    private fallDistance(): number {
        return this.ctx.height - BIN_HEIGHT - 20 - ITEM_HEIGHT - FALL_TOP;
    }

    private addText(text: string, y: number, fontSize: number, fill: string, fontStyle = "normal"): Konva.Text {
        const node = new Konva.Text({
            x: 100,
            y,
            width: this.ctx.width - 200,
            text,
            fontSize,
            fontFamily: "Arial",
            fontStyle,
            fill,
            align: "center",
        });
        this.ctx.group.add(node);
        return node;
    }

    private addButton(
        label: string,
        x: number,
        y: number,
        width: number,
        height: number,
        fill: string,
        onClick: () => void,
    ): void {
        const button = new Konva.Group({ x, y });

        button.add(new Konva.Rect({ width, height, fill, cornerRadius: 10 }));
        button.add(new Konva.Text({
            width,
            height,
            text: label,
            fontSize: 22,
            fontFamily: "Arial",
            fontStyle: "bold",
            fill: "white",
            align: "center",
            verticalAlign: "middle",
        }));

        button.on("click tap", onClick);
        button.on("mouseenter", () => this.setCursor("pointer"));
        button.on("mouseleave", () => this.setCursor("default"));
        this.ctx.group.add(button);
    }

    private setCursor(cursor: string): void {
        const container = this.ctx.group.getStage()?.container();
        if (container) container.style.cursor = cursor;
    }
}