export type BuildingType = "park" | "housing" | "factory";

export interface CityBuilding {
  id: string;
  type: BuildingType;
}

export interface WeatherDamageResult {
  populationLost: number;
  destroyedBuildings: CityBuilding[];
}

const BUILDING_COSTS: Record<BuildingType, number> = {
  park: 50000,
  housing: 80000,
  factory: 60000,
};

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
    // Return copies so callers cannot change the city's inventory directly.
    return this.buildings.map((building) => ({ ...building }));
  }

  build(type: BuildingType): boolean {
    const cost = BUILDING_COSTS[type];

    if (this.money < cost) {
      return false;
    }

    this.money -= cost;

    this.buildings.push({
      id: `building-${this.nextBuildingId}`,
      type,
    });
    this.nextBuildingId++;

    switch (type) {
      case "park":
        this.pollution = Math.max(0, this.pollution - 5);
        break;

      case "housing":
        this.population += 500;
        break;

      case "factory":
        this.pollution = Math.min(100, this.pollution + 10);
        break;
    }

    return true;
  }

  applyWeatherDamage(
    populationLoss: number,
    destroyedBuildingIds: readonly string[],
  ): WeatherDamageResult {
    if (!Number.isSafeInteger(populationLoss) || populationLoss < 0) {
      throw new Error("Population loss must be a non-negative safe integer");
    }

    const destroyedIds = new Set(destroyedBuildingIds);
    const existingIds = new Set(
      this.buildings.map((building) => building.id),
    );

    // Validate everything before changing any city state.
    for (const id of destroyedIds) {
      if (!existingIds.has(id)) {
        throw new Error(`Building not found: ${id}`);
      }
    }

    const destroyedBuildings = this.buildings.filter(
      (building) => destroyedIds.has(building.id),
    );

    const populationLost = Math.min(populationLoss, this.population);

    this.population -= populationLost;
    this.buildings = this.buildings.filter(
      (building) => !destroyedIds.has(building.id),
    );

    return {
      populationLost,
      destroyedBuildings: destroyedBuildings.map(
        (building) => ({ ...building }),
      ),
    };
  }

  endYear(): void {
    this.year++;
    this.population += Math.round(this.population * 0.02);
    this.money += this.population * 2;
    this.pollution = Math.min(100, this.pollution + 2);
  }
}