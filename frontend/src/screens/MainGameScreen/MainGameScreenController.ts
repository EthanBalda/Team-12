import Konva from "konva";
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT, BACKEND_API_ENDPOINT } from "../../constants.ts";
import { floodEvent } from "../../Weather/WeatherEvent.ts";
import { WeatherEventScreenController } from "../WeatherEventScreen/WeatherEventScreenController";
import {
  DISTRICTS,
  MainGameScreenModel,
  type District,
  type CityState,
} from "./MainGameScreenModel.ts";
import { compareScreenController } from "../CompareScreen/CompareScreenController";
import type { Build } from "../CompareScreen/CompareScreenModel";
import { MainGameScreenView } from "./MainGameScreenView.ts";
import type { MiniGameResult } from "../../MiniGames/types.ts";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModel;
  private readonly view: MainGameScreenView;
  private compareController: compareScreenController;
  private compareOverlay: Konva.Group;
  private weatherOverlay: Konva.Group | null = null;
  private persistenceEnabled = false;
  private saveQueue: Promise<void> = Promise.resolve();

  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new MainGameScreenModel();

    this.view = new MainGameScreenView(
      () => this.openCompare(),
      () => this.handleEndYear(),
      () => {
        if (this.weatherOverlay === null) {
          this.screenSwitcher.switchToScreen({ type: "miniGame", id: "trivia" });
        }
      },
      async () => {
      try {
        await this.saveGame();
        const response = await fetch(`${BACKEND_API_ENDPOINT}/worlds/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }

        window.location.reload();
      } catch (error) {
        console.error("Logout failed:", error);
        this.view.showMessage("Logout failed. Please try again.");
      }
    },
    );

    
    this.compareController = new compareScreenController(
      screenSwitcher,
      (build) => this.handleCompareSelect(build),
      () => this.closeCompare(),
    );

    this.compareOverlay = new Konva.Group({ visible: false });
    this.compareOverlay.add(
      new Konva.Rect({ width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: "#849b8b" }),
      this.compareController.getView().getGroup(),
    );
  

    this.refreshView();
  }

  applyMiniGameResult(result: MiniGameResult): void {
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

  async loadGame(): Promise<void> {
    this.persistenceEnabled = false;
    this.screenSwitcher.switchToScreen({ type: "loading" });
    try {
      const response = await fetch(`${BACKEND_API_ENDPOINT}/worlds/state`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Load failed");
      const { cityState }: { cityState: CityState | null } = await response.json();
      this.startGame();
      if (cityState) this.model.restoreState(cityState);
      this.compareController.setTier(1 + Math.floor((this.model.getStats().year - 1) / 2));
      this.refreshView();
      this.persistenceEnabled = true;
      this.screenSwitcher.switchToScreen({ type: "resumeGame" });
    } catch (error) {
      console.error("Load failed:", error);
      this.screenSwitcher.switchToScreen({ type: "loginWorld" });
      window.alert("Could not load your city. Please try logging in again.");
    }
  }

  private saveGame(): Promise<void> {
    if (!this.persistenceEnabled) return Promise.resolve();
    const body = JSON.stringify(this.model.getState());
    // Keep writes in order so an older purchase cannot overwrite flood damage.
    this.saveQueue = this.saveQueue.catch(() => {}).then(async () => {
      const response = await fetch(`${BACKEND_API_ENDPOINT}/worlds/state`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
      if (!response.ok) throw new Error("Save failed");
    });
    return this.saveQueue;
  }

  startGame(persist = false): void {
    this.persistenceEnabled = persist;
    this.weatherOverlay?.destroy();
    this.weatherOverlay = null;
    this.model = new MainGameScreenModel();
    this.compareController.reset();
    this.closeCompare();
    this.refreshView();
    this.view.show();
  }

  private compareOverlayAttached = false;
  private openCompare(): void {
    if (this.weatherOverlay !== null) return;
    if (!this.compareOverlayAttached) {
      this.view.getGroup().add(this.compareOverlay);
      this.compareOverlayAttached = true;
    }
    this.compareOverlay.visible(true);
    this.compareController.show();
    this.compareController.updateMoney(this.model.getStats().money);
    this.view.getGroup().getLayer()?.draw();
  }

  private closeCompare(): void {
    this.compareOverlay.visible(false);
    this.view.getGroup().getLayer()?.draw();
  }

  private handleCompareSelect(build: Build): boolean {
    if (this.weatherOverlay !== null) return false;

    if (!this.model.build(build, this.view.getSelectedDistrict())) {
      this.view.showMessage("Not enough money!"); // stay open so they can pick the other
      return false;
    }

    this.closeCompare();
    this.refreshView();
    this.view.showMessage(`Built ${build.name} in ${this.view.getSelectedDistrict().toUpperCase()}`);
    return true;
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

    // Advance Building Tier
    const YEARS_PER_TIER = 2; // Currently increments tier every two years
    this.compareController.setTier(1 + Math.floor((stats.year - 1) / YEARS_PER_TIER));
    this.view.showMessage("Congrats! You have unlocked a new tier of buildings with new and upgraded ones.");

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
      () => {
        void this.saveGame().catch(() => this.view.showMessage("Could not save your city. Please try again."));
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
    void this.saveGame().catch(() => this.view.showMessage("Could not save your city. Please try again."));
  }
}