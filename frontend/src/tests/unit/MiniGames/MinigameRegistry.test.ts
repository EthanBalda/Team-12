import { describe, expect, it } from "vitest";
import { MINIGAMES } from "../../../minigames/registry";
import { TriviaMinigame } from "../../../minigames/trivia/TriviaMinigame";

describe("MINIGAMES", () => {
    it("creates a new trivia game each time it is played", () => {
        const first = MINIGAMES.trivia();
        const second = MINIGAMES.trivia();

        expect(first).toBeInstanceOf(TriviaMinigame);
        expect(first.title).toBe("Environmental Trivia");
        expect(second).not.toBe(first);
    });
});