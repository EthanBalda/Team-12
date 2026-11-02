import type Konva from "konva";

export type StatDelta = Partial<{ money: number; population: number; pollution: number }>;

export interface MinigameResult {
  delta: StatDelta;   // reward or penalty applied to the city
  summary: string;    // text feedback shown afterwards ("7/10 correct, +$20,000")
}

export interface MinigameContext {
  group: Konva.Group;                          // where the minigame draws
  width: number;
  height: number;
  finish(result: MinigameResult): void;        // the minigame calls this once when done
}