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
	private districtDialog: Konva.Group;
	private selectedBuildIndex: number | null = null;
	private selectedDistrict: string | null = null;

	constructor(
		onSelect: (index: number, district: string) => boolean,
		onCancel: () => void,
	) {
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

		this.districtDialog = new Konva.Group({visible: false});

		this.districtDialog.add(
			new Konva.Rect({
				x: (STAGE_WIDTH - 600) / 2,
				y: (STAGE_HEIGHT - 300) / 2,
				width: 600,
				height: 370,
				fill: "#FFFDF5",
				stroke: "#E0E4DE",
				strokeWidth: 1,
				cornerRadius: 18,
				shadowColor: "black",
				shadowBlur: 24,
				shadowOpacity: 0.18,
				shadowOffsetY: 8,
			}),
		);

		const districts = ["North", "East", "South", "West"];
		const colors = ["#3b6ea8", "#b7791f", "#38805a", "#8056a3"];


		districts.forEach((district, index) => {
			const button = new Konva.Group({
				x: (STAGE_WIDTH - 320) / 2,
				y: (STAGE_HEIGHT - 300) / 2 + 70 + index * 55,
			});

			button.name("district-option");

			button.add(
				new Konva.Rect({
				width: 320,
				height: 46,
				fill: colors[index]!,
				stroke: colors[index]!,
				strokeWidth: 1,
				cornerRadius: 10,
			}),
			new Konva.Text({
				width: 320,
				height: 46,
				text: district,
				fontSize: 20,
				fontFamily: "Arial",
				fontStyle: "bold",
				fill: "white",
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);
			button.on("click tap", () => {
				this.selectedDistrict = district.toLowerCase();

				this.districtDialog.find(".district-option").forEach((option) => {
					const rect = (option as Konva.Group).findOne<Konva.Rect>("Rect")!;
					rect.strokeWidth(1);
					rect.stroke(rect.fill());
				});

				const rect = button.findOne<Konva.Rect>("Rect")!;
				rect.stroke("#14235D");
				rect.strokeWidth(4);

				this.group.getLayer()?.batchDraw();
			});

			this.districtDialog.add(button);
		});


		const dialogCancel = new Konva.Group({
			name: "district-cancel",
			x: (STAGE_WIDTH - 600) / 2 + 490,
			y: (STAGE_HEIGHT - 300) / 2 + 20,
		});

		dialogCancel.add(
			new Konva.Rect({
				width: 90,
				height: 36,
				fill: "#ECEFF1",
				cornerRadius: 8,
			}),
			new Konva.Text({
				width: 90,
				height: 36,
				text: "Cancel",
				fontSize: 16,
				fontStyle: "bold",
				fill: "#14235D",
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);

		dialogCancel.on("click tap", () => {
			this.districtDialog.hide();
			this.selectedBuildIndex = null;
			this.selectedDistrict = null;
			this.districtDialog.find(".district-option").forEach((option) => {
				const rect = (option as Konva.Group).findOne<Konva.Rect>("Rect")!;
				rect.strokeWidth(1);
				rect.stroke(rect.fill());
			});
			this.group.getLayer()?.batchDraw();
		});

		this.districtDialog.add(dialogCancel);

		const confirm = new Konva.Group({
			x: (STAGE_WIDTH - 200) / 2,
			y: (STAGE_HEIGHT - 300) / 2 + 305,
		});

		confirm.add(
			new Konva.Rect({
				width: 200,
				height: 45,
				fill: "#00B5A5",
				cornerRadius: 10,
			}),
			new Konva.Text({
				width: 200,
				height: 45,
				text: "Confirm purchase",
				fontSize: 18,
				fontStyle: "bold",
				fill: "white",
				align: "center",
				verticalAlign: "middle",
				listening: false,
			}),
		);

		confirm.on("click tap", () => {
		if (
			this.selectedBuildIndex === null ||
			this.selectedDistrict === null
		) {
			return;
		}

		const purchased = onSelect(
			this.selectedBuildIndex,
			this.selectedDistrict,
		);

		if (purchased) {
			this.districtDialog.hide();
			this.selectedBuildIndex = null;
			this.selectedDistrict = null;
			this.group.getLayer()?.batchDraw();
		}
	});

		this.districtDialog.add(confirm);


		this.group.add(this.districtDialog);
		this.districtDialog.add(
			new Konva.Text({
				x: (STAGE_WIDTH - 600) / 2,
				y: (STAGE_HEIGHT - 300) / 2 + 25,
				width: 600,
				text: "Choose a district",
				fontSize: 26,
				fontFamily: "Arial",
				align: "center",
				fill: "#14235D",
				fontStyle: "bold",
				listening: false,
			}),
		);

		for (let i = 0; i < CHOICE_COUNT; i++) {
			const x = SIDE_MARGIN + i * (PANEL_WIDTH + PANEL_GAP);
			const panel = this.createPanel(x, () => {
				this.selectedBuildIndex = i;
				this.selectedDistrict = null;

				this.districtDialog.find(".district-option").forEach((option) => {
					const rect = (option as Konva.Group).findOne<Konva.Rect>("Rect")!;
					rect.strokeWidth(1);
					rect.stroke(rect.fill());
				});

				this.districtDialog.show();
				this.districtDialog.moveToTop();
				this.group.getLayer()?.batchDraw();
			});
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
			cancel.on("click tap", () => {
				this.districtDialog.hide();
				this.selectedBuildIndex = null;
				this.selectedDistrict = null;
				onCancel();
			});
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
