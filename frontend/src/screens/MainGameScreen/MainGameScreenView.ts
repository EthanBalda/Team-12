
import Konva from "konva";
import type { View } from "../../types.ts";
import {
  DISTRICTS,
  type CityBuilding,
  type District,
} from "./MainGameScreenModel.ts";
import buildOptions from "../CompareScreen/buildOptions.json";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

export class MainGameScreenView implements View {
  private group: Konva.Group;
  private statsGroup: Konva.Group;
  private modalGroup: Konva.Group;
  private statsText: Record<string, Konva.Text> = {};
	private onOpenBuild: () => void;
	private onEndYear: () => void;
  private onLogout: () => void;
  private selectedDistrict: District = "north";
  private districtRegions: Partial<Record<District, Konva.Line>> = {};
  private districtOutlines: Partial<Record<District, Konva.Line>> = {};
  private buildings: CityBuilding[] = [];
  private buildingGroups: Partial<Record<District, Konva.Group>> = {};
  private buildingImages: Record<string, HTMLImageElement> = {};
  private readonly buildingTooltip = new Konva.Label({
    name: "building-tooltip",
    visible: false,
    listening: false,
  });

  private readonly yearText = new Konva.Text({
    x: 980,
    y: 150,
    width: 190,
    text: "Year 1",
    fontFamily: "Arial",
    fontSize: 18,
    align: "right",
    fill: "#14265d",
  });

  private onMinigame: () => void;
  constructor(
    onOpenBuild: () => void,
    onEndYear: () => void,
    onMinigame: () => void,
    onLogout: () => void,
  ) {
    this.group = new Konva.Group({ visible: false });
    this.statsGroup = new Konva.Group();
    this.modalGroup = new Konva.Group({ visible: false });
	  this.onOpenBuild = onOpenBuild;
    this.onEndYear = onEndYear;
    this.onMinigame = onMinigame;
    this.onLogout = onLogout;


    //simple background color
    this.group.add(new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#849b8b",
    }));

    //loads teh city background
    const cityImage = new Image();
    cityImage.onload = () => {
      const background = new Konva.Image({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        image: cityImage,
      });

      this.group.add(background);
      background.zIndex(1);
      this.group.getLayer()?.draw();
    };
    cityImage.src = "/bg.svg";

    //status cards
    this.group.add(new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: 145,
      fill: "#101820",
      opacity: 0.72,
    }));

    this.createStatCard("population", "POPULATION", 20);
    this.createStatCard("money", "MONEY", STAGE_WIDTH / 2 - 200);
    this.createStatCard("pollution", "POLLUTION", STAGE_WIDTH - 400);

    this.group.add(this.statsGroup);

    // logout button
    this.addButton(
      this.group,
      "LOGOUT",
      STAGE_WIDTH - 130,
      15,
      110,
      40,
      "#dc2626",
      () => this.onLogout(),
    );

    this.addButton(
      this.group,
      "Build",
      30,
      STAGE_HEIGHT - 85,
      180,
      55,
      "#287a55",
      () => this.onOpenBuild(),
    );

    this.addButton(
      this.group,
      "End Year",
      STAGE_WIDTH - 210,
      STAGE_HEIGHT - 85,
      180,
      55,
      "#315f9b",
      () => this.onEndYear(),
    );

    // Four map regions meet at the city center.
    const map = new Konva.Group({
      name: "city-map", x: 30, y: 170,
      clipX: 0, clipY: 0, clipWidth: 1140, clipHeight: 470,
    });
    const regions: Record<District, { points: number[]; x: number; y: number }> = {
      north: { points: [0, 0, 1140, 0, 570, 235], x: 505, y: 10 },
      south: { points: [0, 470, 570, 235, 1140, 470], x: 505, y: 440 },
      east: { points: [1140, 0, 1140, 470, 570, 235], x: 920, y: 140 },
      west: { points: [0, 0, 570, 235, 0, 470], x: 90, y: 140 },
    };

    const outlines: Record<District, number[]> = {
      north: [50, 18, 1090, 18, 570, 212],
      south: [50, 452, 570, 258, 1090, 452],
      east: [1122, 28, 1122, 442, 602, 235],
      west: [18, 28, 538, 235, 18, 442],
    };
    DISTRICTS.forEach((district) => {
      const { points, x, y } = regions[district];
      const region = new Konva.Group({ name: `district-${district}` });
      const shape = new Konva.Line({ points, closed: true });
      this.districtRegions[district] = shape;
      const outline = new Konva.Line({
        points: outlines[district], closed: true,
        stroke: "#2c675d", strokeWidth: 3, listening: false,
      });
      this.districtOutlines[district] = outline;
      region.add(shape, outline, new Konva.Rect({
        x: x - 8, y: y - 4, width: 146, height: 28,
        fill: "#e9eddd", cornerRadius: 5, listening: false,
      }), new Konva.Text({
        x,
        y,
        width: 130,
        text: district.toUpperCase(),
        fontFamily: "Arial",
        fontSize: 20,
        fontStyle: "bold",
        fill: "#14265d",
        align: "center",
        listening: false,
      }));
      const buildings = new Konva.Group({ name: "buildings" });
      this.buildingGroups[district] = buildings;
      region.add(buildings);
      region.on("click tap", () => {
        this.selectedDistrict = district;
        this.renderBuildings();
      });
      region.on("mouseenter", () => {
        region.getStage()?.container().style.setProperty("cursor", "pointer");
      });
      region.on("mouseleave", () => {
        region.getStage()?.container().style.setProperty("cursor", "default");
      });
      map.add(region);
    });
    // Decoration never intercepts region clicks or building hover events.
    const terrain = new Konva.Group({ name: "terrain", listening: false });
    const river = [25, -20, 45, 80, 30, 160, 60, 260, 35, 400, 15, 490];
    terrain.add(
      new Konva.Line({ points: river, tension: 0.35, stroke: "#d5d8bc", strokeWidth: 60 }),
      new Konva.Line({ points: river, tension: 0.35, stroke: "#79abb5", strokeWidth: 38 }),
      new Konva.Line({ points: river, tension: 0.35, stroke: "#b5d7d9", strokeWidth: 3 }),
    );
    ([[120, 65], [980, 390], [120, 400], [980, 75]] as const).forEach(([x, y]) => {
      ([[0, 0], [22, 10], [10, -19]] as const).forEach(([dx, dy]) => {
        terrain.add(
          new Konva.Circle({ x: x + dx, y: y + dy + 5, radius: 13, fill: "#8ca184" }),
          new Konva.Circle({ x: x + dx, y: y + dy, radius: 12, fill: "#4f8060" }),
          new Konva.Circle({ x: x + dx - 3, y: y + dy - 3, radius: 7, fill: "#69946b" }),
        );
      });
    });
    const roads = new Konva.Group({ name: "roads", listening: false });
    [[0, 0, 570, 235, 1140, 470], [0, 470, 570, 235, 1140, 0]].forEach((points) => {
      roads.add(
        new Konva.Line({ points, stroke: "#d8d3c2", strokeWidth: 28 }),
        new Konva.Line({ points, stroke: "#66716e", strokeWidth: 20 }),
        new Konva.Line({ points, stroke: "#eee6c7", strokeWidth: 2, dash: [12, 12] }),
      );
    });
    roads.add(
      new Konva.Circle({ x: 570, y: 235, radius: 24, fill: "#66716e", stroke: "#d8d3c2", strokeWidth: 3 }),
      new Konva.Circle({ x: 570, y: 235, radius: 12, fill: "#8fa780" }),
    );
    map.add(terrain, roads);
    this.group.add(map);

    this.buildingTooltip.add(
      new Konva.Tag({ fill: "white", stroke: "#14265d", cornerRadius: 6 }),
      new Konva.Text({
        width: 280,
        padding: 10,
        fontFamily: "Arial",
        fontSize: 18,
        lineHeight: 1.4,
        fill: "#14265d",
      }),
    );
    this.group.add(this.yearText, this.buildingTooltip);

    this.renderBuildings();

    this.addButton(
      this.group,
      "Minigame",
      STAGE_WIDTH / 2 - 90,
      STAGE_HEIGHT - 85,
      180,
      55,
      "#8a5a9b",
      () => this.onMinigame(),
    );

    this.group.add(this.modalGroup);
  }

  getSelectedDistrict(): District {
    return this.selectedDistrict;
  }

  updateBuildings(buildings: CityBuilding[]): void {
    this.buildings = buildings.map((building) => ({ ...building }));
    this.renderBuildings();
  }

  private renderBuildings(): void {
    DISTRICTS.forEach((district) => {
      const selected = district === this.selectedDistrict;
      this.districtRegions[district]?.setAttrs({
        fill: selected ? "#c7d3b4" : "#b1c3a8",
        stroke: "#849b80",
        strokeWidth: 1,
      });
      this.districtOutlines[district]?.visible(selected);
    });

    this.buildingTooltip.hide();
    // Fit compact rows along the inside of each district's diagonal roads.
    const bounds: Record<District, { x: number; y: number; width: number; height: number }> = {
      north: { x: 340, y: 40, width: 460, height: 90 },
      south: { x: 340, y: 340, width: 460, height: 90 },
      east: { x: 840, y: 170, width: 260, height: 130 },
      west: { x: 40, y: 170, width: 260, height: 130 },
    };
    DISTRICTS.forEach((district) => {
      const group = this.buildingGroups[district]!;
      group.destroyChildren();
      const buildings = this.buildings.filter((building) => building.district === district);
      const area = bounds[district];
      // Fit every building without overlapping or imposing an inventory page limit.
      const columns = Math.max(1, Math.min(
        buildings.length, Math.ceil(Math.sqrt(buildings.length * area.width / area.height)),
      ));
      const rows = Math.max(1, Math.ceil(buildings.length / columns));
      const cellWidth = area.width / columns;
      const cellHeight = area.height / rows;
      const size = Math.min(64, cellWidth * 0.85, cellHeight * 0.85);
      buildings.forEach((building, index) => {
        const asset = buildOptions.find((option) => option.name === building.type)!.type;
        if (!this.buildingImages[asset]) {
          const image = new Image();
          image.onload = () => this.renderBuildings();
          image.src = `/${asset}.png`;
          this.buildingImages[asset] = image;
        }
        const image = this.buildingImages[asset]!;
        const ratio = image.naturalWidth / image.naturalHeight || 1;
        const width = Math.min(size, size * ratio);
        const height = Math.min(size, size / ratio);
        let x = area.x + (index % columns) * cellWidth + (cellWidth - width) / 2;
        let y = area.y + Math.floor(index / columns) * cellHeight + (cellHeight - height) / 2;
        if (district === "north" || district === "south") {
          const roadY = Math.min(x + width / 2, 1140 - x - width / 2) * 235 / 570;
          y += district === "north" ? roadY - 36 - area.height - area.y : 470 - roadY + 36 - area.y;
        } else {
          const roadX = Math.min(y + height / 2, 470 - y - height / 2) * 570 / 235;
          x += district === "west" ? roadX - 100 - area.width - area.x : 1140 - roadX + 100 - area.x;
        }
        const icon = new Konva.Image({
          name: building.id,
          x,
          y,
          width,
          height,
          image,
        });
        icon.on("mouseenter", () => {
          this.buildingTooltip.getText().text(
            `${building.type}\nHealth: ${building.health}/${building.maxHealth}`,
          );
          const position = icon.getAbsolutePosition(this.group);
          const tooltipHeight = this.buildingTooltip.getText().height();
          // Stay between the side labels, below North and above South.
          this.buildingTooltip.position({
            x: Math.max(270, Math.min(position.x, 950 - this.buildingTooltip.width() - 12)),
            y: Math.max(210, Math.min(
              district === "south" ? position.y - tooltipHeight - 12 : position.y + height + 12,
              600 - tooltipHeight,
            )),
          });
          this.buildingTooltip.show();
          this.group.getLayer()?.batchDraw();
        });
        icon.on("mouseleave", () => {
          this.buildingTooltip.hide();
          this.group.getLayer()?.batchDraw();
        });
        group.add(icon);
      });
    });
    this.group.getLayer()?.batchDraw();
  }

  private createStatCard(
    key: string,
    label: string,
    x: number,
  ): void {
    const card = new Konva.Group({ x, y: 20 });

    card.add(new Konva.Rect({
      width: 240,
      height: 105,
      fill: "#ffffff",
      opacity: 0.94,
      cornerRadius: 12,
    }));

    card.add(new Konva.Text({
      x: 15,
      y: 12,
      width: 210,
      text: label,
      fontSize: 16,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#53616b",
    }));

    const value = new Konva.Text({
      x: 15,
      y: 42,
      width: 210,
      text: "—",
      fontSize: 28,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#17232c",
    });

    card.add(value);
    this.statsText[key] = value;
    this.statsGroup.add(card);
  }

  updateStats(stats: {
    population: number;
    money: number;
    pollution: number;
    year: number;
  }): void {
    this.statsText.population.text(
      stats.population.toLocaleString(),
    );
    this.statsText.money.text(
      `$${stats.money.toLocaleString()}`,
    );
    this.statsText.pollution.text(`${stats.pollution}/100`);

    this.group.getLayer()?.draw();
  }

  updateYear(year: number): void {
    this.yearText.text(`Year ${year}`);
    this.group.getLayer()?.batchDraw();
  }


  showMessage(message: string): void {
    const notice = new Konva.Text({
      x: 20,
      y: 660,
      width: STAGE_WIDTH - 40,
      text: message,
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#14265d",
      padding: 12,
    });

    this.group.add(notice);
    this.group.getLayer()?.draw();

    window.setTimeout(() => {
      notice.destroy();
      this.group.getLayer()?.draw();
    }, 2500);
  }

  private addButton(
    parent: Konva.Group,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    onClick: () => void,
  ): void {
    const button = new Konva.Group({ x, y });

    button.add(new Konva.Rect({
      width,
      height,
      fill: color,
      cornerRadius: 10,
    }));

    button.add(new Konva.Text({
      width,
      height,
      text: label,
      fontSize: 19,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "white",
      align: "center",
      verticalAlign: "middle",
    }));

    button.on("click tap", onClick);
    button.on("mouseenter", () => {
      button.getStage()?.container().style.setProperty(
        "cursor",
        "pointer",
      );
    });
    button.on("mouseleave", () => {
      button.getStage()?.container().style.setProperty(
        "cursor",
        "default",
      );
    });

    parent.add(button);
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
