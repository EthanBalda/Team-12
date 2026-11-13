import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Konva from "konva";
import { MainGameScreenController } from "../../../screens/MainGameScreen/MainGameScreenController";
import { DISTRICTS, MainGameScreenModel } from "../../../screens/MainGameScreen/MainGameScreenModel";
import { MainGameScreenView } from "../../../screens/MainGameScreen/MainGameScreenView";
import buildOptions from "../../../screens/CompareScreen/buildOptions.json";

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

beforeEach(() => {
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
});

const clickButton = (group: Konva.Group, label: string) => {
  const text = group.findOne<Konva.Text>(
    (node: Konva.Node) => node instanceof Konva.Text && node.text() === label && node.isVisible(),
  );
  expect(text).toBeDefined();
  text!.getParent()!.fire("click");
};

it("highlights South and purchases the next building there through Build", () => {
  const build = vi.spyOn(MainGameScreenModel.prototype, "build");
  const controller = new MainGameScreenController({ switchToScreen: vi.fn() });
  const view = controller.getView();
  const group = view.getGroup();
  view.show();

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

  clickButton(group, "Build");
  clickButton(group, "Select");
  expect(build).toHaveBeenCalledWith(expect.any(Object), "south");
  expect(build).toHaveReturnedWith(true);
  const purchasedName = build.mock.calls[0]![0].name;
  const icon = south.findOne<Konva.Image>(".building-1")!;
  expect(icon).toBeInstanceOf(Konva.Image);
  icon.fire("mouseenter");
  const tooltip = group.findOne<Konva.Label>(".building-tooltip")!;
  expect(tooltip.visible()).toBe(true);
  expect(tooltip.getText().text()).toBe(`${purchasedName}\nHealth: 50/50`);
  icon.fire("mouseleave");
  expect(tooltip.visible()).toBe(false);
  expect(southShape.fill()).toBe(selectedFill);

  north.fire("tap");
  expect(view.getSelectedDistrict()).toBe("north");
  expect(north.findOne(".building-1")).toBeUndefined();
  expect(south.findOne(".building-1")).toBeDefined();
  group.destroy();
  vi.clearAllTimers();
});

it("renders all buildings in their districts using catalog PNGs without pagination", () => {
  const view = new MainGameScreenView(vi.fn(), vi.fn(), vi.fn(), vi.fn());
  const buildings = Array.from({ length: 40 }, (_, index) => ({
    id: `building-${index + 1}`,
    type: buildOptions[index % buildOptions.length]!.name,
    district: DISTRICTS[index % DISTRICTS.length]!,
    health: 35,
    maxHealth: 50,
    populationLoss: 0,
  }));
  view.updateBuildings(buildings);
  const group = view.getGroup();
  const images = new Map<string, CanvasImageSource>();
  for (const building of buildings) {
    const district = group.findOne<Konva.Group>(`.district-${building.district}`)!;
    const icon = district.findOne<Konva.Image>(`.${building.id}`)!;
    expect(icon).toBeInstanceOf(Konva.Image);
    const asset = buildOptions.find((option) => option.name === building.type)!.type;
    expect((icon.image() as HTMLImageElement).getAttribute("src")).toBe(`/${asset}.png`);
    if (images.has(asset)) expect(icon.image()).toBe(images.get(asset));
    images.set(asset, icon.image()!);
    // Every icon corner must remain inside its triangular district.
    const points = district.findOne<Konva.Line>("Line")!.points();
    for (const x of [icon.x(), icon.x() + icon.width()]) {
      for (const y of [icon.y(), icon.y() + icon.height()]) {
        const crossProducts = [0, 2, 4].map((i) => {
          const j = (i + 2) % points.length;
          return (points[j]! - points[i]!) * (y - points[i + 1]!) -
            (points[j + 1]! - points[i + 1]!) * (x - points[i]!);
        });
        expect(crossProducts.every((cross) => cross >= 0) ||
          crossProducts.every((cross) => cross <= 0)).toBe(true);
      }
    }
  }
  expect(group.find("Image")).toHaveLength(buildings.length);
  expect(group.findOne((node: Konva.Node) => node instanceof Konva.Text &&
    ["Previous", "Next"].includes(node.text()))).toBeUndefined();
  view.updateBuildings([]);
  // Late image loads must not bring removed buildings back.
  for (const image of images.values()) (image as HTMLImageElement).dispatchEvent(new Event("load"));
  expect(group.find("Image")).toHaveLength(0);
  group.destroy();
});

it("refreshes health after floods and removes destroyed icons through the city controller", () => {
  const controller = new MainGameScreenController({ switchToScreen: vi.fn() });
  const view = controller.getView();
  const group = view.getGroup();
  view.show();
  clickButton(group, "Build");
  clickButton(group, "Select");
  group.findOne(".district-south")!.fire("click");
  clickButton(group, "Build");
  clickButton(group, "Select");
  const tooltip = group.findOne<Konva.Label>(".building-tooltip")!;
  group.findOne(".building-1")!.fire("mouseenter");
  expect(tooltip.getText().text()).toContain("Health: 50/50");

  const resolveAnnualFlood = () => {
    clickButton(group, "End Year");
    clickButton(group, "Face the Flood");
    clickButton(group, "Return to City");
  };
  resolveAnnualFlood(); // North floods first, even though South is selected.
  expect(tooltip.visible()).toBe(false);
  expect(view.getSelectedDistrict()).toBe("south");
  group.findOne(".building-1")!.fire("mouseenter");
  expect(tooltip.getText().text()).toContain("Health: 10/50");
  group.findOne(".building-2")!.fire("mouseenter");
  expect(tooltip.getText().text()).toContain("Health: 50/50");
  for (let i = 0; i < 4; i++) resolveAnnualFlood(); // South, East, West, North.
  expect(group.findOne(".building-1")).toBeUndefined();
  expect(group.findOne(".building-2")).toBeDefined();
  expect(tooltip.visible()).toBe(false);
  group.findOne(".building-2")!.fire("mouseenter");
  expect(tooltip.getText().text()).toContain("Health: 10/50");
  group.destroy();
});
