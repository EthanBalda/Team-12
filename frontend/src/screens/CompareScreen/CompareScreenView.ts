import Konva from "konva";
import type { View } from "../../types";
import type { Build } from "./CompareScreenModel";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants";

const CHOICE_COUNT = 3;
const SIDE_MARGIN = 40;
const PANEL_GAP = 30;
const PANEL_WIDTH =
  (STAGE_WIDTH - SIDE_MARGIN * 2 - PANEL_GAP * (CHOICE_COUNT - 1)) / CHOICE_COUNT;
const PANEL_HEIGHT = STAGE_HEIGHT-300;
const PANEL_Y = 130;
const PANEL_PADDING = 24;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 50;

const IMAGE_SIZE = 160;

const imagePath = (type: string) =>`/${type}.png`;

type Panel = {
	group: Konva.Group;
	nameText: Konva.Text;
	statsText: Konva.Text;
	image: Konva.Image;
};

/**
 * compareScreenView - Renders the compare screen (two building panels side by side)
 */
export class compareScreenView implements View {
	private group: Konva.Group;
	private panels: Panel[] = [];
	//private messageText: Konva.Text;
	private moneyText: Konva.Text;

	constructor(onSelect: (index: number) => void, onCancel: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Title (top of screen)
		const title = new Konva.Text({
			x: 25,
			y: 25,
			width: STAGE_WIDTH,
			text: "Build",
			fontSize: 32,
			fontStyle: "bold",
			fontFamily: "Arial",
			fill: "Black",
		});
		this.group.add(title);

		// Current money, centered under the title
		this.moneyText = new Konva.Text({
			x: 25,
			y: 75,
			width: STAGE_WIDTH,
			text: "",
			fontSize: 26, 
			fontStyle: "bold",
			fontFamily: "Arial",
			fill: "#17232c",
		});
		this.group.add(this.moneyText);

		for (let i = 0; i < CHOICE_COUNT; i++) {
			const x = SIDE_MARGIN + i * (PANEL_WIDTH + PANEL_GAP);
			const panel = this.createPanel(x, () => onSelect(i));
			this.panels.push(panel);
			this.group.add(panel.group);
		};

		// Feedback message under the panels
		/*
		this.messageText = new Konva.Text({
			x: 0,
			y: STAGE_HEIGHT - 30,
			width: STAGE_WIDTH,
			text: "",
			fontSize: 22,
			fontFamily: "Arial",
			fill: "Green",
			align: "center",
		});
		this.group.add(this.messageText);*/

		const cancel = new Konva.Group({ x: STAGE_WIDTH-120-30, y: 30 });
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

		const image = new Konva.Image({
			x: (PANEL_WIDTH - IMAGE_SIZE) / 2,
			y: PANEL_PADDING + 65,
			width: IMAGE_SIZE,
			height: IMAGE_SIZE,
			image: undefined,
			visible: false,
		});
		panel.add(image);


		const statsText = new Konva.Text({
			x: PANEL_PADDING,
			y: PANEL_PADDING + + IMAGE_SIZE + 80,
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

		return { group: panel, nameText, statsText, image };
	}

	private setPanelImage(panel: Panel, build: Build | null): void {
		// Hide any previous image right away so a stale one never lingers
		panel.image.visible(false);
		if (build === null) return;

		const src = imagePath(build.type);
		const img = new Image();

		img.onload = () => {
			// Ignore a late load if the panel has moved on to another building
			if (panel.nameText.text() !== build.name) return;
			if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

			const scale = Math.min(
			IMAGE_SIZE / img.naturalWidth,
			IMAGE_SIZE / img.naturalHeight,
			);
			const w = img.naturalWidth * scale;
			const h = img.naturalHeight * scale;

			panel.image.image(img);
			panel.image.size({ width: w, height: h });
			panel.image.position({
			x: (PANEL_WIDTH - w) / 2,
			y: PANEL_PADDING + 65 + (IMAGE_SIZE - h) / 2,
			});
			panel.image.visible(true);
			this.group.getLayer()?.batchDraw();
		};

		img.onerror = () => {
			console.warn(`Missing image: ${src} (for "${build.name}")`);
		};

		img.src = src;
	}

	private renderPanel(panel: Panel, build: Build | null): void {
	if (build === null) {
		panel.nameText.text("Unavailable");
		panel.statsText.text("");
		return;
	}

	panel.nameText.text(build.name);
	this.setPanelImage(panel, build);
	panel.statsText.text(
		`Cost: $${(build.money).toLocaleString()}\n` +
		`Pollution: ${build.pollution}\n` +
		`Tier: ${build.tier}`,
	);
	}

	updateBuilds(builds: (Build | null)[]): void {
		this.panels.forEach((panel, i) => this.renderPanel(panel, builds[i] ?? null));
		//this.messageText.text("");
		this.group.getLayer()?.batchDraw();
	}

	updateMoney(money: number): void {
		this.moneyText.text(`Available funds: $${money.toLocaleString()}`);
		this.group.getLayer()?.batchDraw();
	}

	/*showMessage(message: string): void {
		this.messageText.fill("red");
		this.messageText.text(message);
		this.group.getLayer()?.batchDraw();
	}*/

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
