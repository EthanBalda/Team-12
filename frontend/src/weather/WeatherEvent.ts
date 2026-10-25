export interface Preparation {
  id: string;
  name: string;
  cost: number;
  protection: number;
}

export interface WeatherEvent {
  id: string;
  name: string;
  description: string;
  causedBy: {
    highPollution: string;
    lowPollution: string;
  };
  baseDamage: number;
  preparations: Preparation[];
}

export const floodEvent: WeatherEvent = {
  id: "flood",
  name: "Flood Warning",
  description:
    "Heavy rainfall is approaching. Prepare your city to reduce flood damage.",

  causedBy: {
    highPollution:
      "Your city's pollution contributes to climate warming which can increase the risk of heavy rainfall!",

    lowPollution:
      "A severe rainstorm is bringing more water than your city's drainage system can handle. Flooding can happen even when pollution is low.",
  },

  baseDamage: 40,

  preparations: [
    {
      id: "sandbags",
      name: "Place sandbags",
      cost: 100,
      protection: 10,
    },
    {
      id: "drainage",
      name: "Clear storm drains",
      cost: 200,
      protection: 20,
    },
  ],
};