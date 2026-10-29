import type { WeatherEvent } from "../weather/WeatherEvent";
import {
  WeatherEventModel,
  type WeatherCityState,
} from "../weather/WeatherEventModel";
import { WeatherEventScreenView } from "./WeatherEventScreenView";

export class WeatherEventScreenController {
  private readonly model: WeatherEventModel;
  private readonly view: WeatherEventScreenView;

  constructor(event: WeatherEvent, city: WeatherCityState) {
    this.model = new WeatherEventModel(event, city);

    this.view = new WeatherEventScreenView(
      event.name,
      event.description,
      event.preparations,
      (preparationId) => this.handlePurchase(preparationId),
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

  private handlePurchase(preparationId: string): void {
    const result = this.model.purchasePreparation(preparationId);

    this.refreshView();

    if (result.success) {
      this.view.showMessage(
        "Preparation purchased. Your expected flood damage has decreased.",
      );
      return;
    }

    switch (result.reason) {
      case "insufficient-funds":
        this.view.showMessage(
          "You do not have enough money for this.",
          true,
        );
        break;

      case "already-purchased":
        this.view.showMessage(
          "You have already purchased this.",
          true,
        );
        break;

      case "unknown-preparation":
        this.view.showMessage(
          "This preparation is not available.",
          true,
        );
        break;
    }
  }

  private refreshView(): void {
    const event = this.model.getEvent();

    this.view.update({
      budget: this.model.getBudget(),
      severity: this.model.getSeverity(),
      cause: this.model.getCause(),
      unprotectedDamage: this.model.getUnprotectedDamage(),
      protection: this.model.getProtection(),
      expectedDamage: this.model.getExpectedDamage(),
      purchasedPreparationIds: event.preparations
        .filter((preparation) => this.model.hasPurchased(preparation.id))
        .map((preparation) => preparation.id),
    });
  }
}