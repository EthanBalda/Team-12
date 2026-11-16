import Konva from "konva";
import {describe, expect, it, vi } from "vitest";
import { ConfirmationScreenView } from "../../../screens/ConfirmationScreen/ConfirmationScreenView";
import buildOptions from "../../../screens/CompareScreen/buildOptions.json";

describe("ConfirmationScreenView", () => {
    it("closed the popup when Cancel is clicked", () => {
        const onConfirm = vi.fn();
        const view = new ConfirmationScreenView(onConfirm);
        const parent = new Konva.Group();

        parent.add(view.getGroup());
        view.show();

        const cancelLabel = view.getGroup().findOne<Konva.Text>(
            (node: Konva.Node) =>
                node instanceof Konva.Text && node.text() === "Cancel",
        );

        expect(cancelLabel).toBeDefined();
        cancelLabel!.getParent()!.fire("click");

        expect(parent.getChildren()).toHaveLength(0);
        expect(onConfirm).not.toHaveBeenCalled();
    })

    it("shows how much more money is needed when funds are insufficient", () => {
        const view = new ConfirmationScreenView();
        const plant = buildOptions.find(
            (building) => building.name === "Fossil-Fuel Power Plant",
        );

        expect(plant).toBeDefined();
        view.setPurchaseDetails(plant!, 10_000);
        view.show();

        const warning = view.getGroup().findOne<Konva.Text>(
            (node: Konva.Node) =>
                node instanceof Konva.Text &&
                node.text() === "You need $50,000 more" &&
                node.isVisible(),
        );

        expect(warning).toBeDefined();
        view.getGroup().destroy();
    });
    it("shows the selected building's purchase details", () => {
        const view = new ConfirmationScreenView();
        const factory = buildOptions.find((building) => building.name === "Factory");

        expect(factory).toBeDefined();
        view.setPurchaseDetails(factory!, 500_000);
        view.show();

        const labels = view.getGroup().find<Konva.Text>("Text")
            .filter((node) => node.isVisible())
            .map((node) => node.text());

        expect(labels).toContain("Build Factory?");
        expect(labels).toContain("Cost: $40,000");
        expect(labels).toContain("Money after purchase: $460,000");
        expect(labels).toContain("Population loss if destroyed: 200");
        expect(labels).toContain("Pollution: +10");

        view.getGroup().destroy();
    });

    it("shows a zero remaining balance when funds exactly match the cost", () => {
        const view = new ConfirmationScreenView();
        const factory = buildOptions.find((building) => building.name === "Factory");

        expect(factory).toBeDefined();
        view.setPurchaseDetails(factory!, factory!.money);
        view.show();

        const labels = view.getGroup().find<Konva.Text>("Text")
            .filter((node) => node.isVisible())
            .map((node) => node.text());

        expect(labels).toContain("Money after purchase: $0");
        expect(labels.some((label) => label.startsWith("You need"))).toBe(false);

        view.getGroup().destroy();
    });


});