import { describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { MiniGameScreenView } from "../../../screens/MiniGameScreen/MiniGameScreenView";

function findText(view: MiniGameScreenView, value: string): Konva.Text {
    const text = view.getGroup().find<Konva.Text>("Text").find((node) => node.text() === value);
    if (!text) throw new Error(`No text "${value}"`);
    return text;
}

function click(view: MiniGameScreenView, label: string): void {
    findText(view, label).getParent()!.fire("click");
}

describe("MiniGameScreenView", () => {
    it("calls onQuit when Quit is pressed", () => {
        const onQuit = vi.fn();
        const view = new MiniGameScreenView(onQuit);

        click(view, "Quit");

        expect(onQuit).toHaveBeenCalledOnce();
    });

    it("keeps the quit dialog hidden until it is opened", () => {
        const view = new MiniGameScreenView(vi.fn());
        view.show();
        expect(findText(view, "Leave this minigame?").isVisible()).toBe(false);

        view.showQuitDialog(vi.fn(), vi.fn());

        expect(findText(view, "Leave this minigame?").isVisible()).toBe(true);
    });

    it("runs the matching callback for each dialog button", () => {
        const view = new MiniGameScreenView(vi.fn());
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        view.showQuitDialog(onConfirm, onCancel);

        click(view, "Keep playing");
        expect(onCancel).toHaveBeenCalledOnce();
        expect(onConfirm).not.toHaveBeenCalled();

        click(view, "Leave");
        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("closes the quit dialog when the screen is hidden", () => {
        const view = new MiniGameScreenView(vi.fn());
        const onConfirm = vi.fn();
        view.show();
        view.showQuitDialog(onConfirm, vi.fn());

        view.hide();
        view.show();
        click(view, "Leave");

        expect(findText(view, "Leave this minigame?").isVisible()).toBe(false);
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
