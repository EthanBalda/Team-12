import { floodEvent } from "./weather/WeatherEvent";

const container = document.querySelector<HTMLDivElement>("#container");

if (!container) {
  throw new Error("Game container not found");
}

// Temporary sample data until we implement the actual game logic
const money = 250;
const pollution = 80;

const highPollutionThreshold = 70;
const hasHighPollution = pollution >= highPollutionThreshold;
const damageMultiplier = hasHighPollution ? 1.5 : 1;

const expectedDamage = Math.round(
  floodEvent.baseDamage * damageMultiplier,
);

const severity = hasHighPollution ? "Severe" : "Moderate";

const causedBy = hasHighPollution
  ? floodEvent.causedBy.highPollution
  : floodEvent.causedBy.lowPollution;

container.innerHTML = `
  <h1>${floodEvent.name}</h1>
  <p>${floodEvent.description}</p>

  <h2>City status</h2>
  <p>City budget: $${money}</p>
  <p>Pollution: ${pollution}/100</p>

  <h2>Caused by</h2>
  <p>${causedBy}</p>

  <h2>Expected impact</h2>
  <p>Flood severity: ${severity}</p>
  <p>Expected damage without preparation: ${expectedDamage}</p>

  ${
    hasHighPollution
      ? "<p>High pollution increases the severity of the flood.</p>"
      : ""
  }

  <h2>Preparation options</h2>

  ${floodEvent.preparations
    .map(
      (preparation) => `
        <div>
          <h3>${preparation.name}</h3>
          <p>Cost: $${preparation.cost}</p>
          <p>Reduces damage by: ${preparation.protection}</p>
          <button type="button" disabled>
            Purchase - NOT AVAILABLE
          </button>
        </div>
      `,
    )
    .join("")}
`;