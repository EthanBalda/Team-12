import type { StatDelta } from "../../MiniGames/types.ts";
import type { Build } from "../CompareScreen/CompareScreenModel";

export const DISTRICTS = ["north", "south", "east", "west"] as const;
export type District = (typeof DISTRICTS)[number];

export type BuildingType = string;
export interface CityBuilding {
  id: string;
  type: string;            // holds Build.name
  district: District;
  health: number;
  maxHealth: number;
  populationLoss: number;  // stored per building now
}



export interface WeatherDamageResult {
  populationLost: number;
  affectedBuildings: CityBuilding[];
  destroyedBuildings: CityBuilding[];
}

export class MainGameScreenModel {
  private population = 10000;
  private money = 500000;
  private pollution = 25;
  private year = 1;

  private buildings: CityBuilding[] = [];
  private nextBuildingId = 1;

  getStats() {
    return {
      population: this.population,
      money: this.money,
      pollution: this.pollution,
      year: this.year,
    };
  }

  getBuildings(): CityBuilding[] {
    return this.buildings.map((building) => ({ ...building }));
  }

  spendMoney(amount: number): boolean {
    if (
      !Number.isSafeInteger(amount) ||
      amount < 0 ||
      amount > this.money
    ) {
      return false;
    }

    this.money -= amount;
    return true;
  }

  getBuildCost(option: Build): number {
    return option.money;
  }

    build(option: Build, district: District = "north"): boolean {
      this.validateDistrict(district);

      if (!this.spendMoney(this.getBuildCost(option))) return false;

      const maxHealth = 25 + option.tier * 25;
      this.buildings.push({
        id: `building-${this.nextBuildingId}`,
        type: option.name,
        district,
        health: maxHealth,
        maxHealth,
        populationLoss: option.populationLoss,
      });
      this.nextBuildingId++;

      this.pollution = Math.min(
        100,
        Math.max(0, this.pollution + option.pollution),
      );
      return true;
    }

  applyWeatherDamage(
    damage: number,
    district: District,
  ): WeatherDamageResult {
    if (!Number.isSafeInteger(damage) || damage < 0) {
      throw new Error("Damage must be a non-negative safe integer");
    }

    this.validateDistrict(district);

    if (damage === 0) {
      return {
        populationLost: 0,
        affectedBuildings: [],
        destroyedBuildings: [],
      };
    }

    const affectedBuildings: CityBuilding[] = [];
    const destroyedBuildings: CityBuilding[] = [];

    const updatedBuildings = this.buildings.map((building) => {
      if (building.district !== district) {
        return building;
      }

      const updated = {
        ...building,
        health: Math.max(0, building.health - damage),
      };

      affectedBuildings.push({ ...updated });

      if (updated.health === 0) {
        destroyedBuildings.push({ ...updated });
      }

      return updated;
    });

    const requestedPopulationLoss = destroyedBuildings.reduce(
      (total, building) => total + building.populationLoss, 0,
    );

    const populationLost = Math.min(
      this.population,
      requestedPopulationLoss,
    );

    this.buildings = updatedBuildings.filter(
      (building) => building.health > 0,
    );
    this.population -= populationLost;

    return {
      populationLost,
      affectedBuildings,
      destroyedBuildings,
    };
  }

  // On Minigame completion
  applyDelta(delta: StatDelta): void {
    this.money += delta.money ?? 0;
    this.population += delta.population ?? 0;
    this.pollution = Math.min(100, Math.max(0, this.pollution + (delta.pollution ?? 0)));
  }

  endYear(): void {
    this.year++;
    this.population += Math.round(this.population * 0.02);
    this.money += this.population * 2;
    this.pollution = Math.min(100, this.pollution + 2);
  }

  private validateDistrict(district: District): void {
    if (!DISTRICTS.includes(district)) {
      throw new Error(`Unknown district: ${district}`);
    }
  }
}