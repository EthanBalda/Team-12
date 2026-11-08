
import type { WorldState } from "../types/worldTypes";
import type { YearSummary } from "../types/worldTypes";
import { advanceYear } from "./advanceYear";
import { calculateYearSummary } from "./calculateYearSummary";

// Advances the game by one year and generates a summary of the results.
export function advanceYearWithSummary(world: WorldState): YearSummary {

  // Save a copy of the world before advancing the year.
  // This lets us compare the original statistics with the updated ones.
  const previousState: WorldState = { ...world };

  // Advance the world to the next year.
  // For now, this only increases the year by one.
  // Building effects will be integrated later.
  const currentState = advanceYear(world);

  // Compare the old and new world states to calculate yearly changes.
  const summary = calculateYearSummary(previousState, currentState);

  // Return the summary so the game can display the results to the player.
  return summary;
}
