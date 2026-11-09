import { MiniGame } from "./MiniGames";
import { TestMiniGame } from "./TestMiniGame";
import { SortingMinigame } from "./sorting/SortingMinigame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
    sorting: () => new SortingMinigame(),
} satisfies Record<string, () => MiniGame>;

export type MiniGameId = keyof typeof MINIGAMES;