import { Minigame } from "./Minigames";
import { TestMiniGame } from "./TestMinigame";
import { TriviaMinigame } from "./trivia/TriviaMinigame";

export const MINIGAMES = {
    test: () => new TestMiniGame(),
    trivia: () => new TriviaMinigame    (),
} satisfies Record<string, () => Minigame>;

export type MinigameId = keyof typeof MINIGAMES;