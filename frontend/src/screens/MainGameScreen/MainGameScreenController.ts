import Konva from "konva";
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { floodEvent } from "../../weather/WeatherEvent";
import { WeatherEventScreenController } from "../WeatherEventScreenController";
import {
  DISTRICTS,
  MainGameScreenModel,
  type BuildingType,
  type District,
} from "./MainGameScreenModel.ts";
import { MainGameScreenView } from "./MainGameScreenView.ts";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModel;
  private readonly view: MainGameScreenView;
  private weatherOverlay: Konva.Group | null = null;

  constructor(_screenSwitcher: ScreenSwitcher) {
    super();

    this.model = new MainGameScreenModel();

    this.view = new MainGameScreenView(
      (type, district) => this.handleBuild(type, district),
      () => this.handleEndYear(),
    );

    this.refreshView();
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

    this.model.endYear();
    this.refreshView();

    // Annual floods rotate through districts, starting with north.
    const districtIndex =
      (this.model.getStats().year - 2) % DISTRICTS.length;
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
