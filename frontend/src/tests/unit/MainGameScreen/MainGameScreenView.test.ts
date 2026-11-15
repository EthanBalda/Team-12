import { describe, expect, it, vi } from "vitest";
import Konva from "konva";
import { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import type { MiniGameId } from "../../../MiniGames/registry";

const CHOICES = [
  { id: "trivia" as const, label: "Environmental Trivia" },
  { id: "sorting" as const, label: "Trash Sorting" },
];

function makeView() {
  const onMinigame = vi.fn<(id: MiniGameId) => void>();
  const view = new MainGameScreenView(vi.fn(), vi.fn(), onMinigame, vi.fn(), CHOICES);
  view.show();
  return { view, onMinigame };
}

function findText(view: MainGameScreenView, value: string): Konva.Text {
  const text = view.getGroup().find<Konva.Text>("Text").find((node) => node.text() === value);
  if (!text) throw new Error(`No text "${value}"`);
  return text;
}

function click(view: MainGameScreenView, label: string): void {
  findText(view, label).getParent()!.fire("click");
}

describe("MainGameScreenView minigame picker", () => {
  it("opens the picker when Minigame is pressed", () => {
    const { view, onMinigame } = makeView();
    expect(findText(view, "Play a Minigame").isVisible()).toBe(false);

    click(view, "Minigame");

    expect(findText(view, "Play a Minigame").isVisible()).toBe(true);
    expect(findText(view, "Trash Sorting").isVisible()).toBe(true);
    expect(onMinigame).not.toHaveBeenCalled();
  });

  it("starts the chosen minigame and closes the picker", () => {
    const { view, onMinigame } = makeView();
    click(view, "Minigame");

    click(view, "Trash Sorting");

    expect(onMinigame).toHaveBeenCalledExactlyOnceWith("sorting");
    expect(findText(view, "Play a Minigame").isVisible()).toBe(false);
  });

  it("closes the picker without starting a game when Cancel is pressed", () => {
    const { view, onMinigame } = makeView();
    click(view, "Minigame");

    const cancel = view.getGroup().find<Konva.Text>("Text")
      .filter((node) => node.text() === "Cancel")
      .find((node) => node.isVisible())!;
    cancel.getParent()!.fire("click");

    expect(onMinigame).not.toHaveBeenCalled();
    expect(findText(view, "Play a Minigame").isVisible()).toBe(false);
  });
});
