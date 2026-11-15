import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import Konva from "konva";
import { compareScreenView } from "../../../screens/CompareScreen/CompareScreenView";


describe("CompareScreenView - district selection", () => {
	let view: compareScreenView;
	let onSelect: Mock<(index: number, district: string) => boolean>;
    let onCancel: Mock<() => void>;
    

	beforeEach(() => {
		onSelect = vi.fn<(index: number, district: string) => boolean>()
	        .mockReturnValue(true);
        onCancel = vi.fn<() => void>();

		view = new compareScreenView(onSelect, onCancel);
	});

	afterEach(() => {
		view.getGroup().destroy();
		vi.restoreAllMocks();
	});

	// Find a visible button by its text and simulate a click.
	function clickButton(label: string): void {
		const text = view.getGroup().findOne<Konva.Text>(
			(node: Konva.Node) =>
				node instanceof Konva.Text &&
				node.text() === label &&
				node.isVisible(),
		);

		expect(text).toBeDefined();
		text!.getParent()!.fire("click");
	}

	it("does not purchase without a selected district", () => {
		clickButton("Select");
		clickButton("Confirm purchase");

		expect(onSelect).not.toHaveBeenCalled();
	});
    it.each([
        ["North", "north"],
        ["East", "east"],
        ["South", "south"],
        ["West", "west"],
    ])("passes %s when confirming", (label, district) => {
        clickButton("Select");
        clickButton(label);

        expect(onSelect).not.toHaveBeenCalled();

        clickButton("Confirm purchase");

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(0, district);
    });
    it("cancels without purchasing and clears the district selection", () => {
        clickButton("Select");
        clickButton("South");
        const dialogCancel = view.getGroup().findOne(".district-cancel");
        expect(dialogCancel).toBeDefined();
        dialogCancel!.fire("click");

        expect(onSelect).not.toHaveBeenCalled();

        // Cancel inside the dialog should keep the comparison screen open.
        expect(onCancel).not.toHaveBeenCalled();

        const confirm = view.getGroup().findOne<Konva.Text>(
            (node: Konva.Node) =>
                node instanceof Konva.Text &&
                node.text() === "Confirm purchase",
        );

        expect(confirm).toBeDefined();
        expect(confirm!.isVisible()).toBe(false);

        // Reopen and confirm without choosing a new district.
        clickButton("Select");
        clickButton("Confirm purchase");

        expect(onSelect).not.toHaveBeenCalled();
    });
    it("closes the dialog after a successful purchase", () => {
        onSelect.mockReturnValue(true);

        clickButton("Select");
        clickButton("South");
        clickButton("Confirm purchase");

        expect(onSelect).toHaveBeenCalledTimes(1);

        const confirm = view.getGroup().findOne<Konva.Text>(
            (node: Konva.Node) =>
                node instanceof Konva.Text &&
                node.text() === "Confirm purchase",
        );

        expect(confirm).toBeDefined();
        const dialog = confirm!.getParent()!.getParent()!;
        expect(dialog.isVisible()).toBe(false);
    });
    it("keeps the dialog open when the purchase fails", () => {
        onSelect.mockReturnValue(false);

        clickButton("Select");
        clickButton("South");
        clickButton("Confirm purchase");

        expect(onSelect).toHaveBeenCalledExactlyOnceWith(0, "south");

        const confirm = view.getGroup().findOne<Konva.Text>(
            (node: Konva.Node) =>
                node instanceof Konva.Text &&
                node.text() === "Confirm purchase",
        );

        expect(confirm).toBeDefined();
        const dialog = confirm!.getParent()!.getParent()!;
        expect(dialog.isVisible()).toBe(true);
    });
});