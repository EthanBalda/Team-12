
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import {
  MainGameScreenModel,
  type BuildingType,
} from "./MainGameScreenModel.ts";
import { MainGameScreenView } from "./MainGameScreenView.ts";
import type { MinigameResult } from "../../minigames/types.ts";

export class MainGameScreenController extends ScreenController {
  private model: MainGameScreenModel;
  private view: MainGameScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();

    this.screenSwitcher = screenSwitcher;
    this.model = new MainGameScreenModel();

    this.view = new MainGameScreenView(
      (type) => this.handleBuild(type),
      () => this.handleEndYear(),
      () => this.screenSwitcher.switchToScreen({ type: "miniGame", id: "test" })
    );

    this.view.updateStats(this.model.getStats());
  }

  private handleBuild(type: BuildingType): void {
    const success = this.model.build(type);

    if (!success) {
      this.view.showMessage("Not enough money!");
      return;
    }

    this.view.updateStats(this.model.getStats());
  }

  applyMinigameResult(result: MinigameResult): void {
    this.model.applyDelta(result.delta);
    this.view.updateStats(this.model.getStats());
    this.view.showMessage(result.summary);
  }

  private handleEndYear(): void {
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

    // Update the displayed stats and year.
    this.view.updateStats(stats);
    this.view.updateYear(stats.year);

    // Show the player a summary of the year's changes.
    this.view.showMessage(
        `Year ${stats.year} Summary: Population ${populationChange >= 0 ? "+" : ""}${populationChange}, ` +
        `Money ${moneyChange >= 0 ? "+" : ""}${moneyChange}, ` +
        `Pollution ${pollutionChange >= 0 ? "+" : ""}${pollutionChange}`
    );
}

  startGame(): void {
    this.model = new MainGameScreenModel();
    this.view.updateStats(this.model.getStats());
    this.view.show();
  }

  endGame(): void {
    //temorary to ensure type script checker runs without error this should be changed to a end game screen
    this.screenSwitcher.switchToScreen({type: "mainGame"});
  }

  getView(): MainGameScreenView {
    return this.view;
  }
}
