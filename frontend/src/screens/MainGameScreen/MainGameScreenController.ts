import Konva from "konva";
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { floodEvent } from "../../Weather/WeatherEvent.ts";
import { WeatherEventScreenController } from "../WeatherEventScreen/WeatherEventScreenController";
import {
  DISTRICTS,
  MainGameScreenModel,
  type BuildingType,
  type District,
} from "./MainGameScreenModel.ts";
import { MainGameScreenView } from "./MainGameScreenView.ts";
import type { MinigameResult } from "../../MiniGames/types.ts";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModel;
  private readonly view: MainGameScreenView;
  private weatherOverlay: Konva.Group | null = null;

  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new MainGameScreenModel();

    this.view = new MainGameScreenView(
      (type, district) => this.handleBuild(type, district),
      () => this.handleEndYear(),
      () => {
        if (this.weatherOverlay === null) {
          this.screenSwitcher.switchToScreen({ type: "miniGame", id: "test" });
        }
      },
    );

    this.refreshView();
  }

  applyMinigameResult(result: MinigameResult): void {
    if (this.weatherOverlay !== null) {
      return;
    }

    this.model.applyDelta(result.delta);
    this.refreshView();
    this.view.showMessage(result.summary);
  }

  endGame(): void {
    if (this.weatherOverlay === null) {
      this.screenSwitcher.switchToScreen({ type: "mainGame" });
    }
  }

  getView(): MainGameScreenView {
    return this.view;
  }

  startGame(): void {
    this.weatherOverlay?.destroy();
    this.weatherOverlay = null;
    this.model = new MainGameScreenModel();
    this.refreshView();
    this.view.show();
  }

  private handleBuild(
    type: BuildingType,
    district: District,
  ): void {
    if (this.weatherOverlay !== null) {
      return;
    }

    if (!this.model.build(type, district)) {
      this.view.showMessage("Not enough money!");
      return;
    }

    this.refreshView();
  }

  private handleEndYear(): void {
    if (this.weatherOverlay !== null) {
      return;
    }

    // Save the city's stats before advancing the year.
    const previousStats = this.model.getStats();

    // Advance the year and apply the yearly changes.
    this.model.endYear();

    // Get the updated stats after advancing the year.
    const stats = this.model.getStats();

    // Calculate how much each stat changed.
    const populationChange = stats.population - previousStats.population;
    const moneyChange = stats.money - previousStats.money;
    const pollutionChange = stats.pollution - previousStats.pollution;

    // Update the displayed stats, year, and buildings.
    this.refreshView();

    // Show the player a summary of the year's changes.
    this.view.showMessage(
      `Year ${stats.year} Summary: Population ${populationChange >= 0 ? "+" : ""}${populationChange}, ` +
      `Money ${moneyChange >= 0 ? "+" : ""}${moneyChange}, ` +
      `Pollution ${pollutionChange >= 0 ? "+" : ""}${pollutionChange}`
    );

    // Annual floods rotate through districts, starting with north.
    const districtIndex = (stats.year - 2) % DISTRICTS.length;
    const district = DISTRICTS[districtIndex]!;

    this.openWeather(district);
  }

  private openWeather(district: District): void {
    const overlay = new Konva.Group();
    this.weatherOverlay = overlay;

    // Intercept clicks across the whole city while weather is open.
    overlay.add(
      new Konva.Rect({
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        fill: "black",
        opacity: 0.55,
      }),
    );

    const controller = new WeatherEventScreenController(
      floodEvent,
      this.model,
      district,
      (result) => {
        overlay.destroy();
        this.weatherOverlay = null;

        const stage = this.view.getGroup().getStage();
        if (stage) {
          stage.container().style.cursor = "default";
        }

        this.refreshView();
        this.view.showMessage(
          `${result.district.toUpperCase()} flood: ` +
          `${result.destroyedBuildingIds.length} building(s) destroyed, ` +
          `${result.populationLost} residents lost.`,
        );
      },
    );

    const weatherGroup = controller.getView().getGroup();
    const scale = Math.min(
      (STAGE_WIDTH - 40) / 1000,
      (STAGE_HEIGHT - 40) / 700,
    );

    weatherGroup.scale({ x: scale, y: scale });
    weatherGroup.position({
      x: (STAGE_WIDTH - 1000 * scale) / 2,
      y: (STAGE_HEIGHT - 700 * scale) / 2,
    });

    overlay.add(weatherGroup);
    this.view.getGroup().add(overlay);
    controller.show();
  }

  private refreshView(): void {
    const stats = this.model.getStats();

    this.view.updateStats(stats);
    this.view.updateYear(stats.year);
    this.view.updateBuildings(this.model.getBuildings());
  }
}