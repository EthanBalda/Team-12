import { beforeEach, describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { StartScreenView } from "../../../../src/screens/StartScreen/StartScreenView";

// Mock drawing primitives but retain real Konva Group behaviour,
// including event handlers and child management.
vi.mock("konva", async () => {
    const actual = await vi.importActual<typeof import("konva")>("konva");
    const ActualKonva = actual.default;

    

    class MockText extends ActualKonva.Group {
        private currentText: string;

        constructor(config: any) {
            super(config);
            this.currentText = config.text ?? "";

            const width = config.width ?? 500;
            const fontSize = config.fontSize ?? 18;
            const charsPerLine = Math.max(
                1,
                Math.floor(width / (fontSize * 0.55))
            );

            const lines = String(this.currentText)
                .split("\n")
                .reduce(
                    (total, line) =>
                        total + Math.max(
                            1,
                            Math.ceil(line.length / charsPerLine)
                        ),
                    0
                );

            const estimatedHeight =
                config.height ??
                lines * fontSize * (config.lineHeight ?? 1.2);

            this.height(estimatedHeight);
        }

        text(value?: string): string {
            if (value !== undefined) {
                this.currentText = value;
            }

            return this.currentText;
        }
    }

    return {
    ...actual,
    default: {
        ...ActualKonva,
        Text: MockText
    }
};
});

describe("StartScreenView", () => {
    let view: StartScreenView;
    let onStartNewGame: ReturnType<typeof vi.fn<() => void>>;
    let onContinueGame: ReturnType<typeof vi.fn<() => void>>;
    let onHowToPlay: ReturnType<typeof vi.fn<() => void>>;

    beforeEach(() => {
        onStartNewGame = vi.fn();
        onContinueGame = vi.fn();
        onHowToPlay = vi.fn();

        view = new StartScreenView(
            onStartNewGame,
            onContinueGame,
            onHowToPlay
        );
    });

    const getChildren = () => view.getGroup().getChildren();

    const getButtons = (): Konva.Group[] =>
        getChildren().slice(5) as Konva.Group[];

    const getButtonRect = (index: number): Konva.Group =>
        getButtons()[index].getChildren()[0] as Konva.Group;

    describe("initialisation", () => {
        it("should create a Konva group", () => {
            expect(view.getGroup()).toBeInstanceOf(Konva.Group);
        });

        it("should initially be hidden", () => {
            expect(view.getGroup().visible()).toBe(false);
        });

        it("should create the expected number of children", () => {
            // Background, modal, three headings and three buttons.
            expect(getChildren()).toHaveLength(8);
        });

        it("should create three buttons", () => {
            expect(getButtons()).toHaveLength(3);
        });

        it("should not call any callbacks during initialisation", () => {
            expect(onStartNewGame).not.toHaveBeenCalled();
            expect(onContinueGame).not.toHaveBeenCalled();
            expect(onHowToPlay).not.toHaveBeenCalled();
        });
    });

    describe("button interactions", () => {
        it("should call onStartNewGame when the first button is clicked", () => {
            getButtons()[0].fire("click");

            expect(onStartNewGame).toHaveBeenCalledOnce();
        });

        it("should call onContinueGame when the second button is clicked", () => {
            getButtons()[1].fire("click");

            expect(onContinueGame).toHaveBeenCalledOnce();
        });

        it("should call onHowToPlay when the third button is clicked", () => {
            getButtons()[2].fire("click");

            expect(onHowToPlay).toHaveBeenCalledOnce();
        });

        it("should support touch events on the first button", () => {
            getButtons()[0].fire("tap");

            expect(onStartNewGame).toHaveBeenCalledOnce();
        });

        it("should support touch events on the second button", () => {
            getButtons()[1].fire("tap");

            expect(onContinueGame).toHaveBeenCalledOnce();
        });

        it("should support touch events on the third button", () => {
            getButtons()[2].fire("tap");

            expect(onHowToPlay).toHaveBeenCalledOnce();
        });

        it("should only call the selected button callback", () => {
            getButtons()[1].fire("click");

            expect(onStartNewGame).not.toHaveBeenCalled();
            expect(onContinueGame).toHaveBeenCalledOnce();
            expect(onHowToPlay).not.toHaveBeenCalled();
        });

        it("should call the callback every time a button is clicked", () => {
            getButtons()[0].fire("click");
            getButtons()[0].fire("click");

            expect(onStartNewGame).toHaveBeenCalledTimes(2);
        });
    });

    describe("button hover effects", () => {
        it("should change the first button colour on mouse enter", () => {
            getButtons()[0].fire("mouseenter");

            expect(((getButtonRect(0) as unknown) as Konva.Rect).fill()).toBe("#009f90");
        });

        it("should restore the first button colour on mouse leave", () => {
            getButtons()[0].fire("mouseenter");
            getButtons()[0].fire("mouseleave");

            expect(((getButtonRect(0) as unknown) as Konva.Rect).fill()).toBe("#00b9a5");
        });

        it("should change the second button colour on mouse enter", () => {
            getButtons()[1].fire("mouseenter");

            expect(((getButtonRect(1) as unknown) as Konva.Rect).fill()).toBe("#009f90");
        });

        it("should change the third button colour on mouse enter", () => {
            getButtons()[2].fire("mouseenter");

            expect(((getButtonRect(2) as unknown) as Konva.Rect).fill()).toBe("#009f90");
        });
    });

    describe("visibility", () => {
        it("should show the screen", () => {
            view.show();

            expect(view.getGroup().visible()).toBe(true);
        });

        it("should hide the screen", () => {
            view.show();
            view.hide();

            expect(view.getGroup().visible()).toBe(false);
        });

        it("should allow the screen to be shown and hidden repeatedly", () => {
            view.show();
            expect(view.getGroup().visible()).toBe(true);

            view.hide();
            expect(view.getGroup().visible()).toBe(false);

            view.show();
            expect(view.getGroup().visible()).toBe(true);
        });
    });
});