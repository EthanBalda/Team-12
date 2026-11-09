import { MiniGame } from "./MiniGames";
import { TestMiniGame } from "./TestMiniGame";
import { TriviaMinigame } from "./trivia/TriviaMinigame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
    trivia: () => new TriviaMinigame(),
} satisfies Record<string, () => MiniGame>;

export type MiniGameId = keyof typeof MINIGAMES;