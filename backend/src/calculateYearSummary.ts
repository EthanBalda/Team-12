import type { CityState } from "./cityState.js";
import type { YearSummary } from "./yearSummary.js";

// Compares the city's statistics before and after advancing a year.
// Returns a summary showing how each statistic changed.
export function calculateYearSummary(
  previousState: CityState,
  currentState: CityState
): YearSummary {

  return {
    // The year the player has advanced to.
    year: currentState.year,

    // Save the city's statistics before and after the year changed.
    previousState: { ...previousState },
    currentState: { ...currentState },

    // Calculate the difference between the new and old values.
    // Positive numbers mean an increase; negative numbers mean a decrease.
    changes: {
      money: currentState.money - previousState.money,
      happiness: currentState.happiness - previousState.happiness,
      population: currentState.population - previousState.population,
      pollution: currentState.pollution - previousState.pollution,
    },
  };
}
