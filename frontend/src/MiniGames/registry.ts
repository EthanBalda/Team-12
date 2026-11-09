import { MiniGame } from "./MiniGames";
import { TestMiniGame } from "./TestMiniGame";
import { TriviaMinigame } from "./trivia/TriviaMinigame";
import { SortingMinigame } from "./sorting/SortingMinigame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
    sorting: () => new SortingMinigame(),
    trivia: () => new TriviaMinigame(),
} satisfies Record<string, () => MiniGame>;

export type MiniGameId = keyof typeof MINIGAMES;




