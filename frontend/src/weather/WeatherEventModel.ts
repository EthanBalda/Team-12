import type { WeatherEvent } from "./WeatherEvent";

export interface WeatherCityState {
  money: number;
  pollution: number;
}

export type PurchaseResult =
  | { success: true }
  | {
      success: false;
      reason: "unknown-preparation" | "already-purchased" | "insufficient-funds";
    };

const HIGH_POLLUTION_THRESHOLD = 70;
const HIGH_POLLUTION_DAMAGE_MULTIPLIER = 1.5;

export class WeatherEventModel {
  private readonly purchasedPreparationIds = new Set<string>();

  constructor(
    private readonly event: WeatherEvent,
    private readonly city: WeatherCityState,
  ) {}

  getEvent(): WeatherEvent {
    return this.event;
  }

  getBudget(): number {
    return this.city.money;
  }

  getSeverity(): "Moderate" | "Severe" {
    return this.hasHighPollution() ? "Severe" : "Moderate";
  }

  getCause(): string {
    return this.hasHighPollution()
      ? this.event.causedBy.highPollution
      : this.event.causedBy.lowPollution;
  }

  getUnprotectedDamage(): number {
    const multiplier = this.hasHighPollution()
      ? HIGH_POLLUTION_DAMAGE_MULTIPLIER
      : 1;

    return Math.round(this.event.baseDamage * multiplier);
  }

  getProtection(): number {
    return this.event.preparations.reduce(
      (total, preparation) =>
        this.hasPurchased(preparation.id)
          ? total + preparation.protection
          : total,
      0,
    );
  }

  getExpectedDamage(): number {
    return Math.max(0, this.getUnprotectedDamage() - this.getProtection());
  }

  hasPurchased(preparationId: string): boolean {
    return this.purchasedPreparationIds.has(preparationId);
  }

  purchasePreparation(preparationId: string): PurchaseResult {
    const preparation = this.event.preparations.find(
      (option) => option.id === preparationId,
    );

    if (!preparation) {
      return { success: false, reason: "unknown-preparation" };
    }

    if (this.hasPurchased(preparationId)) {
      return { success: false, reason: "already-purchased" };
    }

    if (this.city.money < preparation.cost) {
      return { success: false, reason: "insufficient-funds" };
    }

    this.city.money -= preparation.cost;
    this.purchasedPreparationIds.add(preparationId);

    return { success: true };
  }

  private hasHighPollution(): boolean {
    return this.city.pollution >= HIGH_POLLUTION_THRESHOLD;
  }
}