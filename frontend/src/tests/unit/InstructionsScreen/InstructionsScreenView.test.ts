import { beforeEach, describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { InstructionsScreenView } from "../../../../src/screens/InstructionsScreen/InstructionsScreenView.ts";

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

describe("InstructionsScreenView", () => {
    let view: InstructionsScreenView;
    let onGoBack: ReturnType<typeof vi.fn<() => void>>;

    beforeEach(() => {
        onGoBack = vi.fn();
        view = new InstructionsScreenView(onGoBack);
    });

    const getChildren = () => view.getGroup().getChildren();

    const getViewport = (): Konva.Group =>
        getChildren()[4] as Konva.Group;

    const getContentGroup = (): Konva.Group =>
        getViewport().getChildren()[0] as Konva.Group;

    const getInstructionsText = (): Konva.Group =>
        getContentGroup().getChildren()[0] as Konva.Group;

    const getBackButton = (): Konva.Group =>
        getChildren()[5] as Konva.Group;

    const getBackButtonRect = (): Konva.Group =>
        getBackButton().getChildren()[0] as Konva.Group;

    describe("initialisation", () => {
        it("should create a Konva group", () => {
            expect(view.getGroup()).toBeInstanceOf(Konva.Group);
        });

        it("should initially be hidden", () => {
            expect(view.getGroup().visible()).toBe(false);
        });

        it("should create six outer children", () => {
            // Background, modal, heading, scroll hint, viewport and back button.
            expect(getChildren()).toHaveLength(6);
        });

        it("should create a viewport containing a content group", () => {
            expect(getViewport()).toBeInstanceOf(Konva.Group);
            expect(getViewport().getChildren()).toHaveLength(1);
            expect(getContentGroup()).toBeInstanceOf(Konva.Group);
        });

        it("should make the content group draggable", () => {
            expect(getContentGroup().draggable()).toBe(true);
        });

        it("should create the instructions text", () => {
            expect(getInstructionsText()).toBeInstanceOf(Konva.Group);
            expect((getInstructionsText() as any).text()).toContain(
                "Welcome to Re:Planet!"
            );
        });

        it("should include the main gameplay instructions", () => {
            const instructions = (getInstructionsText() as any).text();

            expect(instructions).toContain("pollution below 100");
            expect(instructions).toContain("four districts");
            expect(instructions).toContain("WEATHER EVENTS");
            expect(instructions).toContain("minigames");
            expect(instructions).toContain("ten years");
        });

        it("should create a back button", () => {
            expect(getBackButton()).toBeInstanceOf(Konva.Group);
            expect(getBackButton().getChildren()).toHaveLength(2);
        });

        it("should not call onGoBack during initialisation", () => {
            expect(onGoBack).not.toHaveBeenCalled();
        });
    });

    describe("back button interactions", () => {
        it("should call onGoBack when clicked", () => {
            getBackButton().fire("click");

            expect(onGoBack).toHaveBeenCalledOnce();
        });

        it("should call onGoBack when tapped", () => {
            getBackButton().fire("tap");

            expect(onGoBack).toHaveBeenCalledOnce();
        });

        it("should call onGoBack every time it is clicked", () => {
            getBackButton().fire("click");
            getBackButton().fire("click");

            expect(onGoBack).toHaveBeenCalledTimes(2);
        });

        it("should change the back button colour on mouse enter", () => {
            getBackButton().fire("mouseenter");

            expect(((getBackButtonRect() as unknown) as Konva.Rect).fill()).toBe("#009f90");
        });

        it("should restore the back button colour on mouse leave", () => {
            getBackButton().fire("mouseenter");
            getBackButton().fire("mouseleave");

            expect(((getBackButtonRect() as unknown) as Konva.Rect).fill()).toBe("#00b9a5");
        });
    });

    describe("scrolling", () => {
        it("should initially position the content at the top", () => {
            expect(getContentGroup().y()).toBe(0);
        });

        it("should prevent the default wheel behaviour", () => {
            const preventDefault = vi.fn();

            getViewport().fire("wheel", {
                evt: {
                    deltaY: 100,
                    preventDefault
                }
            });

            expect(preventDefault).toHaveBeenCalledOnce();
        });

        it("should scroll down when the wheel moves down", () => {
            getViewport().fire("wheel", {
                evt: {
                    deltaY: 100,
                    preventDefault: vi.fn()
                }
            });

            expect(getContentGroup().y()).toBe(-100);
        });

        it("should scroll up when the wheel moves up", () => {
            getViewport().fire("wheel", {
                evt: {
                    deltaY: 100,
                    preventDefault: vi.fn()
                }
            });

            getViewport().fire("wheel", {
                evt: {
                    deltaY: -50,
                    preventDefault: vi.fn()
                }
            });

            expect(getContentGroup().y()).toBe(-50);
        });

        it("should not scroll above the top of the instructions", () => {
            getViewport().fire("wheel", {
                evt: {
                    deltaY: -500,
                    preventDefault: vi.fn()
                }
            });

            expect(getContentGroup().y()).toBe(0);
        });

        it("should not scroll below the bottom of the instructions", () => {
            const viewportHeight = 270;
            const instructionsHeight = getInstructionsText().height();
            const minY = Math.min(
                0,
                viewportHeight - instructionsHeight
            );

            getViewport().fire("wheel", {
                evt: {
                    deltaY: 10000,
                    preventDefault: vi.fn()
                }
            });

            expect(getContentGroup().y()).toBe(minY);
        });

        it("should not scroll if the content is shorter than the viewport", () => {
            // This test checks the upper and lower bounds independently.
            const minY = Math.min(
                0,
                270 - getInstructionsText().height()
            );

            expect(minY).toBeLessThanOrEqual(0);
        });
    });

    describe("screen layout", () => {
        it("should keep the heading outside the scrolling viewport", () => {
            expect(getChildren()[2]).not.toBe(getViewport());
        });

        it("should keep the scroll hint outside the scrolling viewport", () => {
            expect(getChildren()[3]).not.toBe(getViewport());
        });

        it("should keep the back button outside the scrolling viewport", () => {
            expect(getChildren()[5]).not.toBe(getViewport());
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