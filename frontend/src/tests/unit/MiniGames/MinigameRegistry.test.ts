import { describe, expect, it } from "vitest";
import { MINIGAME_CHOICES, MINIGAMES } from "../../../MiniGames/registry";
import { TriviaMinigame } from "../../../MiniGames/trivia/TriviaMinigame";

describe("MINIGAMES", () => {
    it("creates a new trivia game each time it is played", () => {
        const first = MINIGAMES.trivia();
        const second = MINIGAMES.trivia();

        expect(first).toBeInstanceOf(TriviaMinigame);
        expect(first.title).toBe("Environmental Trivia");
        expect(second).not.toBe(first);
    });

    it("labels each choice with its game's title", () => {
        for (const choice of MINIGAME_CHOICES) {
            expect(MINIGAMES[choice.id]().title).toBe(choice.label);
        }
    });

    it("leaves the test game out of the choices", () => {
        expect(MINIGAME_CHOICES.map((choice) => choice.id)).not.toContain("test");
    });
});