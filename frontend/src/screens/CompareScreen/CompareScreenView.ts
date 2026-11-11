import Konva from "konva";
import type { View } from "../../types";
import type { Build } from "./CompareScreenModel";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

const PANEL_WIDTH = 500;
const PANEL_HEIGHT = 620;
const PANEL_GAP = 60;
const PANEL_Y = 100;
const PANEL_PADDING = 30;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 50;

type Panel = {
	group: Konva.Group;
	nameText: Konva.Text;
	statsText: Konva.Text;
};

/**
 * compareScreenView - Renders the compare screen (two building panels side by side)
 */
export class compareScreenView implements View {
	private group: Konva.Group;
	private leftPanel: Panel;
	private rightPanel: Panel;
	private messageText: Konva.Text;

	constructor(onSelectLeft: () => void, onSelectRight: () => void, onCancel: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Title (top of screen)
		const title = new Konva.Text({
			x: 0,
			y: 30,
			width: STAGE_WIDTH,
			text: "Choose Building",
			fontSize: 32,
			fontStyle: "bold",
			fontFamily: "Arial",
			fill: "Black",
			align: "center",
		});
		this.group.add(title);

		// Two panels + gap are centered on the stage
		const totalWidth = PANEL_WIDTH * 2 + PANEL_GAP;
		const leftX = (STAGE_WIDTH - totalWidth) / 2;
		const rightX = leftX + PANEL_WIDTH + PANEL_GAP;

		this.leftPanel = this.createPanel(leftX, onSelectLeft);
		this.rightPanel = this.createPanel(rightX, onSelectRight);
		this.group.add(this.leftPanel.group, this.rightPanel.group);

		// Feedback message under the panels
		this.messageText = new Konva.Text({
			x: 0,
			y: STAGE_HEIGHT - 60,
			width: STAGE_WIDTH,
			text: "",
			fontSize: 22,
			fontFamily: "Arial",
			fill: "Green",
			align: "center",
		});
		this.group.add(this.messageText);

		const cancel = new Konva.Group({ x: 30, y: 30 });
			cancel.add(
				new Konva.Rect({ width: 120, height: 40, fill: "#59636e", cornerRadius: 10 }),
				new Konva.Text({
				width: 120,
				height: 40,
				text: "Cancel",
				fontSize: 18,
				fontStyle: "bold",
				fontFamily: "Arial",
				fill: "white",
				align: "center",
				verticalAlign: "middle", 
				listening: false,
				}),
			);
			cancel.on("click tap", onCancel);
			this.group.add(cancel);

	}

	/**
	 * Builds one comparison tab. Children are positioned relative to the panel group.
	 */
	private createPanel(x: number, onSelect: () => void): Panel {
		const panel = new Konva.Group({ x, y: PANEL_Y });

		const frame = new Konva.Rect({
			width: PANEL_WIDTH,
			height: PANEL_HEIGHT,
			fill: "White",
			stroke: "Black",
			strokeWidth: 4,
			cornerRadius: 10,
		});
		panel.add(frame);

		const nameText = new Konva.Text({
			x: PANEL_PADDING,
			y: PANEL_PADDING,
			width: PANEL_WIDTH - PANEL_PADDING * 2,
			text: "",
			fontSize: 28,
			fontStyle: "bold",
			fontFamily: "Arial",
			fill: "Black",
			align: "left",
		});
		panel.add(nameText);

		const divider = new Konva.Line({
			points: [
				PANEL_PADDING,
				PANEL_PADDING + 50,
				PANEL_WIDTH - PANEL_PADDING,
				PANEL_PADDING + 50,
			],
			stroke: "#999",
			strokeWidth: 2,
		});
		panel.add(divider);

		const statsText = new Konva.Text({
			x: PANEL_PADDING,
			y: PANEL_PADDING + 70,
			width: PANEL_WIDTH - PANEL_PADDING * 2,
			text: "",
			fontSize: 22,
			fontFamily: "Arial",
			fill: "#333",
			lineHeight: 1.6,
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

		return { group: panel, nameText, statsText };
	}

	private renderPanel(panel: Panel, build: Build | null): void {
		if (build === null) {
			panel.nameText.text("Unavailable");
			panel.statsText.text("Stats unavailable");
			return;
		}

		panel.nameText.text(build.name);
		panel.statsText.text(
			`Cost: ${build.money}\n` +
			`Pollution: ${build.pollution}\n` +
			`Tier: ${build.tier}`,
		);
	}

	/**
	 * Update both panels (null if a build couldn't be loaded)
	 */
	updateBuilds(left: Build | null, right: Build | null): void {
		this.renderPanel(this.leftPanel, left);
		this.renderPanel(this.rightPanel, right);
		this.messageText.text("");
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * Show which building was selected
	 */
	showSelection(build: Build): void {
		this.messageText.text(`Previously Selected: ${build.name}`);
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
