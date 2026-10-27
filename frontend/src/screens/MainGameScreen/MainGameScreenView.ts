
import Konva from "konva";
import type { View } from "../../types.ts";
import type { BuildingType } from "./MainGameScreenModel.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

export class MainGameScreenView implements View {
  private group: Konva.Group;
  private statsGroup: Konva.Group;
  private modalGroup: Konva.Group;
  private statsText: Record<string, Konva.Text> = {};
	private onBuild: (type: BuildingType) => void;
	private onEndYear: () => void;
  constructor(
    onBuild: (type: BuildingType) => void,
    onEndYear: () => void,
  ) {
    this.group = new Konva.Group({ visible: false });
    this.statsGroup = new Konva.Group();
    this.modalGroup = new Konva.Group({ visible: false });
	this.onBuild = onBuild;
  	this.onEndYear = onEndYear;


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
      background.moveToBottom();
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
    this.createStatCard("money", "MONEY", STAGE_WIDTH / 2 - 120);
    this.createStatCard("pollution", "POLLUTION", STAGE_WIDTH - 260);

    this.group.add(this.statsGroup);

    this.addButton(
      this.group,
      "Build",
      30,
      STAGE_HEIGHT - 85,
      180,
      55,
      "#287a55",
      () => this.showBuildModal(),
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

    this.createBuildModal();
    this.group.add(this.modalGroup);
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
	//need to work on
    console.log(`Year ${year}`);
  }

  private createBuildModal(): void {
    this.modalGroup.add(new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "black",
      opacity: 0.6,
    }));

    const panelWidth = 440;
    const panelHeight = 390;
    const panelX = (STAGE_WIDTH - panelWidth) / 2;
    const panelY = (STAGE_HEIGHT - panelHeight) / 2;

    this.modalGroup.add(new Konva.Rect({
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      fill: "#ffffff",
      cornerRadius: 16,
    }));

    this.modalGroup.add(new Konva.Text({
      x: panelX + 25,
      y: panelY + 20,
      width: panelWidth - 80,
      text: "Build in Your City",
      fontSize: 25,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#17232c",
    }));

    this.addButton(
      this.modalGroup,
      "Park — $50,000",
      panelX + 25,
      panelY + 75,
      panelWidth - 50,
      60,
      "#287a55",
      () => this.selectBuilding("park"),
    );

    this.addButton(
      this.modalGroup,
      "Housing — $80,000",
      panelX + 25,
      panelY + 150,
      panelWidth - 50,
      60,
      "#477ca8",
      () => this.selectBuilding("housing"),
    );

    this.addButton(
      this.modalGroup,
      "Factory — $60,000",
      panelX + 25,
      panelY + 225,
      panelWidth - 50,
      60,
      "#a66c36",
      () => this.selectBuilding("factory"),
    );

    this.addButton(
      this.modalGroup,
      "Cancel",
      panelX + 25,
      panelY + 310,
      panelWidth - 50,
      45,
      "#59636e",
      () => this.hideBuildModal(),
    );
  }

  private selectBuilding(type: BuildingType): void {
    this.hideBuildModal();
    this.onBuild(type);
  }

  private showBuildModal(): void {
    this.modalGroup.visible(true);
    this.group.getLayer()?.draw();
  }

  private hideBuildModal(): void {
    this.modalGroup.visible(false);
    this.group.getLayer()?.draw();
  }

  showMessage(message: string): void {
    //message notification for like user error
    const notice = new Konva.Text({
      x: 20,
      y: 160,
      text: message,
      fontSize: 18,
      fontFamily: "Arial",
      fill: "white",
      padding: 12,
      fillAfterStrokeEnabled: true,
    });

    this.group.add(notice);
    this.group.getLayer()?.draw();

    // Remove the notice after a short delay.
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
