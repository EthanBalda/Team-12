
import type { CityState } from "./cityState.js";
import type { YearSummary } from "./yearSummary.js";
import { advanceYear } from "./advanceYear.js";
import { calculateYearSummary } from "./calculateYearSummary.js";

// Advances the game by one year and generates a summary of the results.
export function advanceYearWithSummary(city: CityState): YearSummary {

  // Save a copy of the city before advancing the year.
  // This lets us compare the original statistics with the updated ones.
  const previousState: CityState = { ...city };

  // Advance the city to the next year.
  // For now, this only increases the year by one.
  // Building effects will be integrated later.
  const currentState = advanceYear(city);

  // Compare the old and new city states to calculate yearly changes.
  const summary = calculateYearSummary(previousState, currentState);

  // Return the summary so the game can display the results to the player.
  return summary;
}
