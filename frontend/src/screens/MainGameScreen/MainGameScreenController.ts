
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import {
  MainGameScreenModel,
  type BuildingType,
} from "./MainGameScreenModel.ts";
import { MainGameScreenView } from "./MainGameScreenView.ts";

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

  private handleEndYear(): void {
    this.model.endYear();

    const stats = this.model.getStats();
    this.view.updateStats(stats);
    this.view.updateYear(stats.year);
    this.view.showMessage(`Welcome to Year ${stats.year}!`);
  }

  startGame(): void {
    this.model = new MainGameScreenModel();
    this.view.updateStats(this.model.getStats());
    this.view.show();
  }

  getView(): MainGameScreenView {
    return this.view;
  }
}
