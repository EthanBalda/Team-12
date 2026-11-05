import { Minigame } from "./MiniGames";
import { TestMiniGame } from "./TestMiniGame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
} satisfies Record<string, () => Minigame>;

export type MinigameId = keyof typeof MINIGAMES;