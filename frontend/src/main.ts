import Konva from "konva";
import { floodEvent } from "./weather/WeatherEvent";
import { WeatherEventScreenController } from "./screens/WeatherEventScreenController";

const container = document.querySelector<HTMLDivElement>("#container");

if (!container) {
  throw new Error("Game container not found");
}

const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 700;

const stage = new Konva.Stage({
  container,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
});

const layer = new Konva.Layer();
stage.add(layer);

//Temporary starting values
const city = {
  money: 250,
  pollution: 80,
};

const weatherController = new WeatherEventScreenController(
  floodEvent,
  city,
);

layer.add(weatherController.getView().getGroup());
weatherController.show();

function resizeStage(): void {
  const availableWidth = Math.max(1, window.innerWidth - 32);
  const scale = Math.min(1, availableWidth / SCREEN_WIDTH);

  stage.width(SCREEN_WIDTH * scale);
  stage.height(SCREEN_HEIGHT * scale);
  stage.scale({ x: scale, y: scale });
  stage.batchDraw();
}

window.addEventListener("resize", resizeStage);
resizeStage();