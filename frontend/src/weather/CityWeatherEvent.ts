import {
  MainGameScreenModel,
  type District,
} from "../screens/MainGameScreen/MainGameScreenModel";
import type { WeatherEvent } from "./WeatherEvent";
import {
  WeatherEventModel,
  type PurchaseResult,
  type WeatherCityState,
} from "./WeatherEventModel";

export type CityPreparationResult =
  | PurchaseResult
  | { success: false; reason: "event-resolved" };

export interface WeatherResolution {
  readonly district: District;
  readonly damage: number;
  readonly populationLost: number;
  readonly destroyedBuildingIds: readonly string[];
}

export class CityWeatherEvent {
  private readonly city: MainGameScreenModel;
  private readonly event: WeatherEvent;
  private readonly district: District;
  private readonly weather: WeatherEventModel;
  private resolution: WeatherResolution | null = null;

  constructor(
    event: WeatherEvent,
    city: MainGameScreenModel,
    district: District,
  ) {
    this.city = city;
    this.event = event;
    this.district = district;

    const weatherState: WeatherCityState = {
      get money() {
        return city.getStats().money;
      },

      set money(remainingMoney: number) {
        const cost = city.getStats().money - remainingMoney;

        if (!city.spendMoney(cost)) {
          throw new Error("Could not deduct the preparation cost");
        }
      },

      get pollution() {
        return city.getStats().pollution;
      },
    };

    this.weather = new WeatherEventModel(event, weatherState);
  }

  getState() {
    return {
      district: this.district,
      budget: this.weather.getBudget(),
      severity: this.weather.getSeverity(),
      cause: this.weather.getCause(),
      unprotectedDamage: this.weather.getUnprotectedDamage(),
      protection: this.weather.getProtection(),
      expectedDamage:
        this.resolution?.damage ?? this.weather.getExpectedDamage(),
      purchasedPreparationIds: this.event.preparations
        .filter((preparation) =>
          this.weather.hasPurchased(preparation.id),
        )
        .map((preparation) => preparation.id),
      resolved: this.resolution !== null,
    };
  }

  purchasePreparation(preparationId: string): CityPreparationResult {
    if (this.resolution !== null) {
      return { success: false, reason: "event-resolved" };
    }

    return this.weather.purchasePreparation(preparationId);
  }

  resolve(): WeatherResolution {
    if (this.resolution !== null) {
      return this.resolution;
    }

    const damage = this.weather.getExpectedDamage();
    const result = this.city.applyWeatherDamage(
      damage,
      this.district,
    );

    this.resolution = Object.freeze({
      district: this.district,
      damage,
      populationLost: result.populationLost,
      destroyedBuildingIds: Object.freeze(
        result.destroyedBuildings.map((building) => building.id),
      ),
    });

    return this.resolution;
  }
}