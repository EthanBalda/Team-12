import Konva from "konva";
import type { IFrame } from "konva/lib/types";
import type { MiniGameContext, MiniGameResult } from "./types.ts";

/**
 * Base class for all MiniGames.
 *
 * Subclasses implement `title` and `setup()`, draw into `this.ctx.group`,
 * and call `this.finish(result)` once when the game ends. Timers, animations,
 * and window listeners created through the helpers below are cleaned up
 * automatically by `destroy()`. The host can pause and resume a game, which
 * stops and restarts its animations. Timeouts keep running while paused.
 */
export abstract class MiniGame {
    abstract readonly title: string;

    protected ctx!: MiniGameContext;
    private finished = false;
    private cleanups: (() => void)[] = [];
    private animations: Konva.Animation[] = [];
    private paused = false;

    /** Called by the host. Subclasses override setup(), not this. */
    start(ctx: MiniGameContext): void {
        this.ctx = ctx;
        this.finished = false;
        this.cleanups = [];
        this.animations = [];
        this.paused = false;
        this.setup();
        this.redraw();
    }

    /** Build shapes and start game logic. */
    protected abstract setup(): void;

    /** Report the result to the host. Ignored after the first call. */
    protected finish(result: MiniGameResult): void {
        if (this.finished) return;
        this.finished = true;
        this.ctx.finish(result);
    }

    protected isFinished(): boolean {
        return this.finished;
    }

    /** Called by the host, for example while the quit dialog is open. */
    pause(): void {
        if (this.paused || this.finished) return;
        this.paused = true;
        for (const animation of this.animations) animation.stop();
    }

    resume(): void {
        if (!this.paused) return;
        this.paused = false;
        for (const animation of this.animations) animation.start();
    }

    /** Called by the host when the game ends or the player quits. */
    destroy(): void {
        this.finished = true;
        // reverse order: undo the most recently started thing first
        for (const cleanup of this.cleanups.reverse()) cleanup();
        this.cleanups = [];
        this.animations = [];
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
        this.animations.push(animation);
        this.cleanups.push(() => animation.stop());
        return animation;
    }
}
