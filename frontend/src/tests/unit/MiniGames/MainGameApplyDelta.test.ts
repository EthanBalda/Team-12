import { beforeEach, describe, expect, it } from "vitest";
import { MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";

describe("MainGameScreenModel.applyDelta", () => {
    let model: MainGameScreenModel;
    let start: ReturnType<MainGameScreenModel["getStats"]>;

    beforeEach(() => {
        model = new MainGameScreenModel();
        start = model.getStats();
    });

    it("adds a reward to every stat", () => {
        model.applyDelta({ money: 1000, population: 50, pollution: 5 });

        expect(model.getStats()).toMatchObject({
            money: start.money + 1000,
            population: start.population + 50,
            pollution: start.pollution + 5,
        });
    });

    it("leaves stats missing from the delta unchanged", () => {
        model.applyDelta({ money: 1000 });

        expect(model.getStats()).toMatchObject({
            money: start.money + 1000,
            population: start.population,
            pollution: start.pollution,
        });
    });

    it("does not let pollution go above 100", () => {
        model.applyDelta({ pollution: 1000 });

        expect(model.getStats().pollution).toBe(100);
    });

    it("does not let pollution go below 0", () => {
        model.applyDelta({ pollution: -1000 });

        expect(model.getStats().pollution).toBe(0);
    });
});