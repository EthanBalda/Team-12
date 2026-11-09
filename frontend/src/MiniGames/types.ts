import type Konva from "konva";

export type StatDelta = Partial<{ money: number; population: number; pollution: number }>;

export interface MiniGameResult {
  delta: StatDelta;   // reward or penalty applied to the city
  summary: string;    // text feedback shown afterwards ("7/10 correct, +$20,000")
}

export interface MiniGameContext {
  group: Konva.Group;                          // where the minigame draws
  width: number;
  height: number;
  finish(result: MiniGameResult): void;        // the minigame calls this once when done
}