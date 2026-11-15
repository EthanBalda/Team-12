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

export interface MiniGameChoice {
    id: MiniGameId;
    label: string;
}

/** Games the player can pick on the main screen. The test game is left out. */
export const MINIGAME_CHOICES: MiniGameChoice[] = [
    { id: "trivia", label: "Environmental Trivia" },
    { id: "sorting", label: "Trash Sorting" },
];




