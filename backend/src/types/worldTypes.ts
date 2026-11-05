export interface WorldState{
    year: number;
    money: number;
    happiness: number;
    population: number;
    pollution: number;
}

// Represents how much each world statistic changed during one year.
export interface WorldChanges {
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
  previousState: WorldState;

  // The city's statistics after advancing the year.
  currentState: WorldState;

  // The difference between the old and new statistics.
  changes: WorldChanges;
}