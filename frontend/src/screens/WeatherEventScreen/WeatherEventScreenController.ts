import type { WeatherEvent } from "../../weather/WeatherEvent";
import {
  CityWeatherEvent,
  type WeatherResolution,
} from "../../weather/CityWeatherEvent";
import {
  MainGameScreenModel,
  type District,
} from "../MainGameScreen/MainGameScreenModel";
import { WeatherEventScreenView } from "./WeatherEventScreenView";

export class WeatherEventScreenController {
  private readonly event: CityWeatherEvent;
  private readonly view: WeatherEventScreenView;
  private readonly onComplete: (result: WeatherResolution) => void;
  private completed = false;

  constructor(
    definition: WeatherEvent,
    city: MainGameScreenModel,
    district: District,
    onComplete: (result: WeatherResolution) => void,
  ) {
    this.event = new CityWeatherEvent(definition, city, district);
    this.onComplete = onComplete;

    this.view = new WeatherEventScreenView(
      definition.name,
      definition.description,
      definition.preparations,
      (id) => this.handlePurchase(id),
      () => this.handleContinue(),
    );

    this.refreshView();
  }

  getView(): WeatherEventScreenView {
    return this.view;
  }

  show(): void {
    this.refreshView();
    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }

  private handlePurchase(id: string): void {
    const result = this.event.purchasePreparation(id);
    this.refreshView();

    if (result.success) {
      this.view.showMessage(
        "Preparation purchased. Buildings will take less damage.",
      );
      return;
    }

    const messages = {
      "insufficient-funds": "You do not have enough money.",
      "already-purchased": "You have already purchased this preparation.",
      "unknown-preparation": "This preparation is not available.",
      "event-resolved": "This flood has already finished.",
    };

    this.view.showMessage(messages[result.reason], true);
  }

  private handleContinue(): void {
    if (this.completed) {
      return;
    }

    if (!this.event.getState().resolved) {
      const result = this.event.resolve();

      this.refreshView();
      this.view.showMessage(
        `${result.destroyedBuildingIds.length} building(s) destroyed. ` +
        `${result.populationLost} residents lost.\n` +
        "Surviving buildings keep their remaining health.",
      );
      return;
    }

    this.completed = true;
    this.onComplete(this.event.resolve());
  }

  private refreshView(): void {
    this.view.update(this.event.getState());
  }
}