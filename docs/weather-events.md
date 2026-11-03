# Weather events

## Current integration
- `MainGameScreenController` owns the in-memory city and the weather overlay.
- Ending a year advances city stats, then opens the annual flood.
- Flood districts rotate north, south, east, west, starting after year 1.
- `MainGameScreenView` displays district buildings, health, year and budget.
- District buttons and the building list are temporary pending the teammate's map.
- `WeatherEventScreenController` handles purchases, resolution and return.
- `WeatherEventScreenView` displays the budget, damage forecast and preparations.
- `WeatherEventModel` calculates severity, protection and purchase eligibility.
- `CityWeatherEvent` connects those rules to the actual city and caches resolution.
- `MainGameScreenModel` owns buildings, health, district damage and city stats.

## Preparation and damage rules
- Sandbags cost $100 and reduce damage by 10; drainage costs $200 and reduces it by 20.
- Each preparation can be purchased once per event using the city's budget.
- Unaffordable, duplicate and unknown purchases are rejected, as are purchases after resolution.
- Flood base damage is 40; pollution of at least 70 multiplies it by 1.5.
- Protection adds together; final damage cannot fall below zero.
- Damage affects every building in the selected flood district only.
- Buildings at zero health are removed and their defined population losses apply.
- Surviving buildings retain remaining health; returning does not repair or reset them.
- Face the Flood resolves once; Return to City closes the overlay once.
- The overlay intercepts city clicks; controller guards block building, year and minigame actions.
- Minigame rewards still update city stats; resume navigation preserves city progress.

## Verification
From `frontend`, run `npm run test:unit`, `npx tsc --noEmit`, and `npm run build`.
The CI test script uses Vitest's existing jsdom configuration and includes
`src/tests/**/*.test.ts`, `src/weather/**/*.test.ts`, and
`src/screens/MainGameScreen/**/*.test.ts`.
Controller tests mock views and exercise real city/weather models.
Backend CI also generates Prisma, type-checks and runs unit tests with mocked database access.

Manual checks: create a city, build in multiple districts, then end the year.
Buy a preparation and verify the budget and forecast; resolve and return.
Check surviving health, unchanged year/budget on return, and district isolation.
Try city/minigame clicks while the flood is open, then play a minigame after return.
Verify its reward and return preserve buildings and progress; end another year to check rotation.

## Persistence limits
City/weather persistence to the database is not implemented.
Progress exists in memory; reloading or starting a new game resets the city.
