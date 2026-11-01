import { Minigame } from "./Minigames";
import { TestMiniGame } from "./TestMinigame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
} satisfies Record<string, () => Minigame>;

export type MinigameId = keyof typeof MINIGAMES;