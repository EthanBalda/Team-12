import type { CityState } from "./cityState.js";

// Represents how much each city statistic changed during one year.
export interface CityChanges {
  money: number;
  happiness: number;
  population: number;
  pollution: number;
}

// Stores the results of advancing the game by one year.
export interface YearSummary {

  // The year the player just advanced to.
  year: number;

  // The city's statistics before advancing the year.
  previousState: CityState;

  // The city's statistics after advancing the year.
  currentState: CityState;

  // The difference between the old and new statistics.
  changes: CityChanges;
}
