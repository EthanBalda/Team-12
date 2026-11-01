import Konva from "konva";
import type { IFrame } from "konva/lib/types";
import type { MinigameContext, MinigameResult } from "./types.ts";

/**
 * Base class for all minigames.
 *
 * Subclasses implement `title` and `setup()`, draw into `this.ctx.group`,
 * and call `this.finish(result)` once when the game ends. Timers, animations,
 * and window listeners created through the helpers below are cleaned up
 * automatically by `destroy()`.
 */
export abstract class Minigame {
    abstract readonly title: string;

    protected ctx!: MinigameContext;
    private finished = false;
    private cleanups: (() => void)[] = [];

    /** Called by the host. Subclasses override setup(), not this. */
    start(ctx: MinigameContext): void {
        this.ctx = ctx;
        this.finished = false;
        this.cleanups = [];
        this.setup();
        this.redraw();
    }

    /** Build shapes and start game logic. */
    protected abstract setup(): void;

    /** Report the result to the host. Ignored after the first call. */
    protected finish(result: MinigameResult): void {
        if (this.finished) return;
        this.finished = true;
        this.ctx.finish(result);
    }

    protected isFinished(): boolean {
        return this.finished;
    }

    /** Called by the host when the game ends or the player quits. */
    destroy(): void {
        this.finished = true;
        // reverse order: undo the most recently started thing first
        for (const cleanup of this.cleanups.reverse()) cleanup();
        this.cleanups = [];
        this.ctx.group.destroyChildren(); // also removes Konva listeners on those shapes
        this.redraw();
    }

    protected redraw(): void {
        this.ctx.group.getLayer()?.batchDraw();
    }

    protected addTimeout(callback: () => void, ms: number): void {
        const id = window.setTimeout(callback, ms);
        this.cleanups.push(() => window.clearTimeout(id));
    }

    /** Runs `onFrame` about 60 times a second until destroy(). */
    protected addAnimation(onFrame: (frame: IFrame) => void): Konva.Animation {
        const animation = new Konva.Animation(onFrame, this.ctx.group.getLayer());
        animation.start();
        this.cleanups.push(() => animation.stop());
        return animation;
    }
}
