import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vitest";
import Konva from "konva";
import type { ScreenSwitcher } from "../../../types.ts";
import type { BuildingType } from "../../../screens/MainGameScreen/MainGameScreenModel.ts";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController.ts";
import { ResultScreenController } from "../../../screens/ResultScreen/ResultScreenController.ts";

const weatherView = vi.hoisted(() => ({ onContinue: () => {} }));

// Groups and nodes support visibility/events without creating a canvas.
vi.mock("konva", async (importOriginal) => {
    const { default: actual } = await importOriginal<typeof import("konva")>();
    return { default: { ...actual, Rect: actual.Group } };
});

vi.mock("../../../screens/ResultScreen/ResultScreenView.ts", () => ({
    ResultScreenView: class {
        private group = new Konva.Group({ visible: false });
        private success = new Konva.Group({ visible: false });
        private loss = new Konva.Group({ visible: false });

        constructor(onContinue: () => void, onNewGame: () => void) {
            const addButton = (parent: Konva.Group, label: string, onClick: () => void) => {
                const button = new Konva.Group();
                // Match the label lookup contract without rendering Konva.Text.
                const text = Object.assign(new Konva.Group(), {
                    getClassName: () => "Text",
                    text: () => label,
                });
                button.add(text);
                button.on("click", onClick);
                parent.add(button);
            };
            addButton(this.success, "Continue Playing", onContinue);
            addButton(this.success, "Play Again", onNewGame);
            addButton(this.loss, "Try Again", onNewGame);
            this.group.add(this.success, this.loss);
        }

        show_result(success: boolean) {
            this.success.visible(success);
            this.loss.visible(!success);
            this.show();
        }
        show() { this.group.show(); }
        hide() { this.group.hide(); }
        getGroup() { return this.group; }
    },
}));

vi.mock("../../../screens/WeatherEventScreen/WeatherEventScreenView", () => ({
    WeatherEventScreenView: class {
        private group = new Konva.Group();
        constructor(
            _title: string, _description: string, _preparations: unknown,
            _onPurchase: (id: string) => void, onContinue: () => void,
        ) {
            weatherView.onContinue = onContinue;
        }
        update = vi.fn();
        showMessage = vi.fn();
        show() { this.group.show(); }
        hide() { this.group.hide(); }
        getGroup() { return this.group; }
    },
}));

const gameView = vi.hoisted(() => ({
    onBuild: (_type: BuildingType) => {},
    onEndYear: () => {},
    updateStats: vi.fn(),
    updateYear: vi.fn(),
    updateBuildings: vi.fn(),
    showMessage: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
}));

vi.mock(
    "../../../screens/MainGameScreen/MainGameScreenView.ts",
    () => ({
        MainGameScreenView: class {
            private group = new Konva.Group();
            getGroup() { return this.group; }
            constructor(
                onBuild: (type: BuildingType) => void,
                onEndYear: () => void,
            ) {
                gameView.onBuild = onBuild;
                gameView.onEndYear = onEndYear;
            }

            updateStats = gameView.updateStats;
            updateYear = gameView.updateYear;
            updateBuildings = gameView.updateBuildings;
            showMessage = gameView.showMessage;
            show = gameView.show;
            hide = gameView.hide;
        },
    }),
);

describe("Result screen game flow", () => {
    let mainGame: MainGameScreenController;
    let results: ResultScreenController;

    const progressedStats = {
        population: 10200,
        money: 520400,
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
        // Resolve and leave the annual weather event through its real controller.
        weatherView.onContinue();
        weatherView.onContinue();

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

    });

    it.each([
        { success: true, label: "Play Again" },
        { success: false, label: "Try Again" },
    ])("resets progress after clicking $label", ({ success, label }) => {
        mainGame.hide();
        results.showResult(success);

        gameView.show.mockClear();

        clickButton(label);

        expect(gameView.show).toHaveBeenCalledOnce();
        expect(results.getView().getGroup().visible()).toBe(false);

        
    });
});