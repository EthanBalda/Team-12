
export type BuildingType = "park" | "housing" | "factory";

export class MainGameScreenModel {
  private population = 10000;
  private money = 500000;
  private pollution = 25;
  private year = 1;

  getStats() {
    return {
      population: this.population,
      money: this.money,
      pollution: this.pollution,
      year: this.year,
    };
  }

  build(type: BuildingType): boolean {
    switch (type) {
      case "park":
        if (this.money < 50000) return false;
        this.money -= 50000;
        this.pollution = Math.max(0, this.pollution - 5);
        return true;

      case "housing":
        if (this.money < 80000) return false;
        this.money -= 80000;
        this.population += 500;
        return true;

      case "factory":
        if (this.money < 60000) return false;
        this.money -= 60000;
        this.pollution = Math.min(100, this.pollution + 10);
        return true;
    }
  }

  endYear(): void {
    this.year++;
    this.population += Math.round(this.population * 0.02);
    this.money += this.population * 2;
    this.pollution = Math.min(100, this.pollution + 2);
  }
}
