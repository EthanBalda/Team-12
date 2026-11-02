import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vitest";
import type Konva from "konva";
import type { ScreenSwitcher } from "../../../types.ts";
import type { BuildingType } from "../../../screens/MainGameScreen/MainGameScreenModel.ts";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController.ts";
import { ResultScreenController } from "../../../screens/ResultScreen/ResultScreenController.ts";

const gameView = vi.hoisted(() => ({
    onBuild: (_type: BuildingType) => {},
    onEndYear: () => {},
    updateStats: vi.fn(),
    updateYear: vi.fn(),
    showMessage: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
}));

vi.mock(
    "../../../screens/MainGameScreen/MainGameScreenView.ts",
    () => ({
        MainGameScreenView: class {
            constructor(
                onBuild: (type: BuildingType) => void,
                onEndYear: () => void,
            ) {
                gameView.onBuild = onBuild;
                gameView.onEndYear = onEndYear;
            }

            updateStats = gameView.updateStats;
            updateYear = gameView.updateYear;
            showMessage = gameView.showMessage;
            show = gameView.show;
            hide = gameView.hide;
        },
    }),
);

describe("Result screen game flow", () => {
    let mainGame: MainGameScreenController;
    let results: ResultScreenController;

    const initialStats = {
        population: 10000,
        money: 500000,
        pollution: 25,
        year: 1,
    };

    const progressedStats = {
        population: 10710,
        money: 441420,
        pollution: 27,
        year: 2,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Connect the controllers using the same routes as main.ts.
        const screenSwitcher: ScreenSwitcher = {
            switchToScreen(screen) {
                mainGame.hide();
                results.hide();

                switch (screen.type) {
                    case "resumeGame":
                        mainGame.show();
                        break;

                    case "mainGame":
                        mainGame.startGame();
                        break;
                }
            },
        };

        mainGame = new MainGameScreenController(screenSwitcher);
        results = new ResultScreenController(screenSwitcher);

        mainGame.startGame();

        // Change every stat before testing Continue or Restart.
        gameView.onBuild("housing");
        gameView.onEndYear();

        expect(gameView.updateStats).toHaveBeenLastCalledWith(
            progressedStats,
        );
    });

    afterEach(() => {
        results.getView().getGroup().destroy();
    });

    function clickButton(label: string) {
        const text = results.getView().getGroup().findOne(
            (node: Konva.Node) =>
                node.getClassName() === "Text" &&
                (node as Konva.Text).text() === label,
        );

        if (!text) {
            throw new Error(`Button "${label}" was not found`);
        }

        expect(text.isVisible()).toBe(true);

        const button = text.getParent();

        if (!button) {
            throw new Error(`Button "${label}" has no parent group`);
        }

        button.fire("click");
    }

    it("preserves progress after clicking Continue Playing", () => {
        mainGame.hide();
        results.showResult(true);

        gameView.show.mockClear();

        clickButton("Continue Playing");

        expect(gameView.show).toHaveBeenCalledOnce();
        expect(results.getView().getGroup().visible()).toBe(false);

        // Perform an action after continuing to check the real model.
        gameView.onBuild("park");

        expect(gameView.updateStats).toHaveBeenLastCalledWith({
            ...progressedStats,
            money: progressedStats.money - 50000,
            pollution: progressedStats.pollution - 5,
        });
    });

    it.each([
        { success: true, label: "Play Again" },
        { success: false, label: "Try Again" },
    ])("resets progress after clicking $label", ({ success, label }) => {
        mainGame.hide();
        results.showResult(success);

        gameView.show.mockClear();

        clickButton(label);

        expect(gameView.updateStats).toHaveBeenLastCalledWith(
            initialStats,
        );
        expect(gameView.show).toHaveBeenCalledOnce();
        expect(results.getView().getGroup().visible()).toBe(false);

        // Confirm subsequent actions use the fresh model.
        gameView.onBuild("park");

        expect(gameView.updateStats).toHaveBeenLastCalledWith({
            ...initialStats,
            money: 450000,
            pollution: 20,
        });
    });
});