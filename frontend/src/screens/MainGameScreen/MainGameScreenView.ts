
import Konva from "konva";
import type { View } from "../../types.ts";
import {
  DISTRICTS,
  type CityBuilding,
  type District,
} from "./MainGameScreenModel.ts";
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
  private buildings: CityBuilding[] = [];
  private buildingPage = 0;
  private displayedYear = 1;

  private readonly districtHeading = new Konva.Text({
    x: 30,
    y: 220,
    width: 1100,
    fontFamily: "Arial",
    fontSize: 22,
    fontStyle: "bold",
    fill: "#14265d",
  });

  private readonly inventoryText = new Konva.Text({
    x: 30,
    y: 265,
    width: 1100,
    height: 300,
    fontFamily: "Arial",
    fontSize: 20,
    lineHeight: 1.7,
    fill: "#14265d",
  });

  private readonly pageText = new Konva.Text({
    x: 450,
    y: 610,
    width: 300,
    fontFamily: "Arial",
    fontSize: 18,
    align: "center",
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

    DISTRICTS.forEach((district, index) => {
      this.addButton(
        this.group,
        district.toUpperCase(),
        30 + index * 285,
        160,
        260,
        42,
        "#187568",
        () => {
          this.selectedDistrict = district;
          this.buildingPage = 0;
          this.renderBuildings();
        },
      );
    });

    this.group.add(
      new Konva.Rect({
        x: 20,
        y: 210,
        width: STAGE_WIDTH - 40,
        height: 440,
        fill: "white",
        opacity: 0.94,
        cornerRadius: 12,
      }),
      this.districtHeading,
      this.inventoryText,
      this.pageText,
    );

    this.addButton(
      this.group,
      "Previous",
      30,
      595,
      160,
      40,
      "#59636e",
      () => {
        this.buildingPage = Math.max(0, this.buildingPage - 1);
        this.renderBuildings();
      },
    );

    this.addButton(
      this.group,
      "Next",
      STAGE_WIDTH - 190,
      595,
      160,
      40,
      "#59636e",
      () => {
        this.buildingPage++;
        this.renderBuildings();
      },
    );

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
    const districtBuildings = this.buildings.filter(
      (building) => building.district === this.selectedDistrict,
    );

    const pageSize = 8;
    const pageCount = Math.max(
      1,
      Math.ceil(districtBuildings.length / pageSize),
    );

    this.buildingPage = Math.min(this.buildingPage, pageCount - 1);

    const visibleBuildings = districtBuildings.slice(
      this.buildingPage * pageSize,
      (this.buildingPage + 1) * pageSize,
    );

    this.districtHeading.text(
      `${this.selectedDistrict.toUpperCase()} DISTRICT — ` +
      `${districtBuildings.length} building(s)`,
    );

    this.inventoryText.text(
      visibleBuildings.length === 0
        ? "No buildings here. Use Build to develop this district."
        : visibleBuildings
            .map((building) =>
              `${building.id}  •  ${building.type}  •  ` +
              `Health: ${building.health}/${building.maxHealth}`,
            )
            .join("\n"),
    );

    this.pageText.text(
      `Year ${this.displayedYear}  •  ` +
      `Page ${this.buildingPage + 1} of ${pageCount}`,
    );

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
    this.displayedYear = year;
    this.renderBuildings();
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
