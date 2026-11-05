import { MiniGame } from "./MiniGames";
import { TestMiniGame } from "./TestMiniGame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
} satisfies Record<string, () => MiniGame>;

export type MiniGameId = keyof typeof MINIGAMES;