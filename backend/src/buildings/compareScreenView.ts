import Konva from "konva";
import type { View } from "../../../../frontend/src/types.ts";
import type { Build } from "./compareScreenModel.ts";

/**
 * compareScreenView - Renders the compare screen
 */


const PANEL_WIDTH = 500;
const PANEL_HEIGHT = 620;
const PANEL_GAP = 60;
const PANEL_Y = 100;
const PANEL_PADDING = 30;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 50;

export class compareScreenView implements View {
	private group: Konva.Group;
	private statsText: Konva.Text;

	constructor(onSelectClick: () => void) {
		const STAGE_WIDTH = 1200;
		const STAGE_HEIGHT = 800;

		this.group = new Konva.Group({ visible: true });

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH/2,
			y: STAGE_HEIGHT-50,
			text: "Choose Building",
			fontSize: 16,
			fontFamily: "Arial",
			fill: "Black",
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);


		const totalWidth = PANEL_WIDTH * 2 + PANEL_GAP;
		const leftX = (STAGE_WIDTH - totalWidth) / 2;
 
		const left = this.createPanel(leftX, onSelectClick);
		this.statsText = left.statsText;
		this.group.add(left.group);

		// Stats display in the building selection frame
		this.statsText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 500,
			text: "",
			fontSize: 18,
			fontFamily: "Arial",
			fill: "Black",
			align: "center",
		});
		this.group.add(this.statsText);
	}


	private createPanel(x: number, onSelect: () => void) {
		const panel = new Konva.Group({ x, y: PANEL_Y });
 
		const frame = new Konva.Rect({
			width: PANEL_WIDTH,
			height: PANEL_HEIGHT,
			fill: "White",
			stroke: "Black",
		});
		panel.add(frame);
 
		const statsText = new Konva.Text({
			x: PANEL_PADDING,
			y: PANEL_PADDING,
			width: PANEL_WIDTH - PANEL_PADDING * 2,
			text: "",
			fontSize: 20,
			fontFamily: "Arial",
			fill: "Black",
			lineHeight: 1.5,
			align: "left",
		});
		panel.add(statsText);
 
		// Select button pinned to the bottom center of the panel
		const button = new Konva.Group({
			x: (PANEL_WIDTH - BUTTON_WIDTH) / 2,
			y: PANEL_HEIGHT - BUTTON_HEIGHT - PANEL_PADDING,
		});
 
		const buttonRect = new Konva.Rect({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			fill: "green",
			stroke: "darkgreen",
			strokeWidth: 3,
			cornerRadius: 10,
		});
 
		// Text sized to the button so align/verticalAlign center it exactly
		const buttonLabel = new Konva.Text({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			text: "Select",
			fontSize: 20,
			fontStyle: "bold",
			fontFamily: "Arial",
			fill: "white",
			align: "center",
			verticalAlign: "middle",
			listening: false,
		});
 
		button.add(buttonRect, buttonLabel);
		button.on("click tap", onSelect);
		panel.add(button);
 
		return { group: panel, statsText };
	}

	/**
	 * Update the stats display (null if they couldn't be loaded)
	 */
	updateStats(build: Build | null): void {
	if (build === null) {
		this.statsText.text("Stats unavailable");
	} else {
		this.statsText.text(
			`Name: ${build.name}\nCost: ${build.money}\nHappiness: ${build.happiness}\nPopulation: ${build.population}`,
		);
	}
	this.group.getLayer()?.batchDraw();
}
	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}