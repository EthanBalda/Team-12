import { afterEach, expect, it, vi } from "vitest";
import Konva from "konva";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import { DISTRICTS, MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";

afterEach(() => {
  vi.useRealTimers();
});

it("highlights South and purchases the next building there through Build", () => {
  // Exercise real Konva nodes and events without drawing to a native canvas.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    measureText: (text: string) => ({ width: text.length * 10 }),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  } as unknown as CanvasRenderingContext2D);
  vi.useFakeTimers();
  const build = vi.spyOn(MainGameScreenModel.prototype, "build");
  const controller = new MainGameScreenController({ switchToScreen: vi.fn() });
  const view = controller.getView();
  const group = view.getGroup();
  view.show();

  const clickButton = (label: string) => {
    const text = group.findOne<Konva.Text>(
      (node: Konva.Node) => node instanceof Konva.Text && node.text() === label && node.isVisible(),
    );
    expect(text).toBeDefined();
    text!.getParent()!.fire("click");
  };

  for (const district of DISTRICTS) {
    expect(group.findOne<Konva.Group>(`.district-${district}`)?.findOne<Konva.Text>("Text")?.text())
      .toBe(district.toUpperCase());
  }
  const north = group.findOne<Konva.Group>(".district-north")!;
  const south = group.findOne<Konva.Group>(".district-south")!;
  const northShape = north.findOne<Konva.Line>("Line")!;
  const southShape = south.findOne<Konva.Line>("Line")!;
  const selectedFill = northShape.fill();
  const unselectedFill = southShape.fill();

  south.fire("click");
  expect(view.getSelectedDistrict()).toBe("south");
  expect(southShape.fill()).toBe(selectedFill);
  expect(northShape.fill()).toBe(unselectedFill);

  clickButton("Build");
  clickButton("Select");
  expect(build).toHaveBeenCalledWith(expect.any(Object), "south");
  expect(build).toHaveReturnedWith(true);
  const purchasedName = build.mock.calls[0]![0].name;
  expect(group.findOne<Konva.Text>(
    (node: Konva.Node) => node instanceof Konva.Text && node.text().includes("building-1"),
  )?.text()).toContain(purchasedName);
  expect(southShape.fill()).toBe(selectedFill);

  north.fire("tap");
  expect(view.getSelectedDistrict()).toBe("north");
  expect(group.findOne<Konva.Text>(
    (node: Konva.Node) => node instanceof Konva.Text && node.text().startsWith("No buildings here."),
  )).toBeDefined();
  group.destroy();
  vi.clearAllTimers();
});
