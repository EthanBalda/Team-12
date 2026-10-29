import Konva from "konva";
import type { Preparation } from "../weather/WeatherEvent";

export interface WeatherScreenState {
  budget: number;
  severity: string;
  cause: string;
  unprotectedDamage: number;
  protection: number;
  expectedDamage: number;
  purchasedPreparationIds: string[];
}

interface PreparationButton {
  group: Konva.Group;
  background: Konva.Rect;
  label: Konva.Text;
  preparation: Preparation;
}

const COLORS = {
  background: "#f5f5f5",
  card: "#ffffff",
  teal: "#00b9a5",
  navy: "#14265d",
  panel: "#eef0f1",
  border: "#d3dadf",
  muted: "#596579",
  disabled: "#cbd2d8",
  error: "#c62828",
};

const FONT = "Georgia";

export class WeatherEventScreenView {
  private readonly group = new Konva.Group();
  private readonly budgetText: Konva.Text;
  private readonly impactText: Konva.Text;
  private readonly causeText: Konva.Text;
  private readonly messageText: Konva.Text;
  private readonly buttons: PreparationButton[] = [];

  constructor(
    title: string,
    description: string,
    preparations: Preparation[],
    onPurchase: (preparationId: string) => void,
  ) {
    this.group.add(
      new Konva.Rect({
        width: 1000,
        height: 700,
        fill: COLORS.background,
      }),
    );

    this.group.add(
      new Konva.Rect({
        x: 80,
        y: 20,
        width: 840,
        height: 660,
        fill: COLORS.card,
        cornerRadius: 24,
        shadowColor: COLORS.navy,
        shadowBlur: 28,
        shadowOpacity: 0.12,
        shadowOffsetY: 12,
      }),
    );

    this.addText(title, 120, 42, 760, 42, {
      fill: COLORS.teal,
      fontStyle: "bold",
      align: "center",
    });

    this.addText(description, 140, 100, 720, 17, {
      align: "center",
    });

    this.budgetText = this.addText("", 120, 153, 760, 22, {
      fontStyle: "bold",
      align: "center",
    });

    this.group.add(
      new Konva.Rect({
        x: 120,
        y: 195,
        width: 760,
        height: 103,
        fill: COLORS.panel,
        stroke: COLORS.border,
        strokeWidth: 1,
        cornerRadius: 13,
      }),
    );

    this.impactText = this.addText("", 140, 209, 720, 18, {
      align: "center",
    });

    this.causeText = this.addText("", 140, 313, 720, 16, {
      align: "center",
      fill: COLORS.muted,
    });

    this.addText("Choose Your Preparations", 120, 379, 760, 25, {
      fontStyle: "bold",
      align: "center",
    });

    // Divide the available row evenly between preparation cards.
    const gap = 20;
    const count = preparations.length;
    const cardWidth = count > 0
      ? (760 - gap * (count - 1)) / count
      : 760;

    preparations.forEach((preparation, index) => {
      this.createPreparationButton(
        preparation,
        120 + index * (cardWidth + gap),
        425,
        cardWidth,
        onPurchase,
      );
    });

    this.messageText = this.addText("", 135, 618, 730, 16, {
      align: "center",
    });
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.show();
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.hide();
    this.resetCursor();
    this.group.getLayer()?.batchDraw();
  }

  update(state: WeatherScreenState): void {
    this.budgetText.text(
      `Available Budget: $${state.budget.toLocaleString()}`,
    );

    this.impactText.text(
      [
        `Flood Severity: ${state.severity}`,
        `Unprepared Damage: ${state.unprotectedDamage}  •  Protection: ${state.protection}`,
        `Expected Damage: ${state.expectedDamage}`,
      ].join("\n"),
    );

    this.causeText.text(state.cause);

    for (const button of this.buttons) {
      const purchased = state.purchasedPreparationIds.includes(
        button.preparation.id,
      );
      const affordable = state.budget >= button.preparation.cost;
      const available = !purchased && affordable;

      button.background.fill(
        available ? COLORS.teal : COLORS.disabled,
      );

      button.label.fill(available ? "white" : COLORS.navy);

      button.label.text(
        purchased
          ? "Purchased"
          : affordable
            ? "Purchase"
            : "Insufficient Funds",
      );

      // The model also validates purchases; this prevents unavailable
      // options from receiving pointer events in the view.
      button.group.listening(available);
    }

    this.resetCursor();
    this.group.getLayer()?.batchDraw();
  }

  showMessage(message: string, isError = false): void {
    this.messageText.text(message);
    this.messageText.fill(
      isError ? COLORS.error : COLORS.navy,
    );
    this.group.getLayer()?.batchDraw();
  }

  private addText(
    text: string,
    x: number,
    y: number,
    width: number,
    fontSize: number,
    options: {
      fill?: string;
      fontStyle?: string;
      align?: string;
    } = {},
  ): Konva.Text {
    const node = new Konva.Text({
      text,
      x,
      y,
      width,
      fontSize,
      fontFamily: FONT,
      fill: options.fill ?? COLORS.navy,
      fontStyle: options.fontStyle ?? "normal",
      align: options.align ?? "left",
      lineHeight: 1.35,
    });

    this.group.add(node);
    return node;
  }

  private createPreparationButton(
    preparation: Preparation,
    x: number,
    y: number,
    width: number,
    onPurchase: (preparationId: string) => void,
  ): void {
    const card = new Konva.Group({ x, y });

    card.add(
      new Konva.Rect({
        width,
        height: 175,
        fill: COLORS.panel,
        stroke: COLORS.border,
        strokeWidth: 1,
        cornerRadius: 13,
      }),
    );

    card.add(
      new Konva.Text({
        x: 16,
        y: 16,
        width: width - 32,
        text: preparation.name,
        fontFamily: FONT,
        fontSize: 21,
        fontStyle: "bold",
        fill: COLORS.navy,
        align: "center",
      }),
    );

    card.add(
      new Konva.Text({
        x: 16,
        y: 55,
        width: width - 32,
        text: [
          `Cost: $${preparation.cost.toLocaleString()}`,
          `Reduces damage by ${preparation.protection}`,
        ].join("\n"),
        fontFamily: FONT,
        fontSize: 17,
        fill: COLORS.navy,
        lineHeight: 1.4,
        align: "center",
      }),
    );

    const button = new Konva.Group({
      x: 16,
      y: 118,
    });

    const background = new Konva.Rect({
      width: width - 32,
      height: 42,
      fill: COLORS.teal,
      cornerRadius: 10,
    });

    const label = new Konva.Text({
      width: width - 32,
      height: 42,
      text: "Purchase",
      fontFamily: FONT,
      fontSize: 18,
      fontStyle: "bold",
      fill: "white",
      align: "center",
      verticalAlign: "middle",
    });

    button.add(background, label);

    button.on("click tap", () => onPurchase(preparation.id));

    button.on("mouseenter", () => {
      const stage = button.getStage();
      if (stage) {
        stage.container().style.cursor = "pointer";
      }
    });

    button.on("mouseleave", () => this.resetCursor());

    this.buttons.push({
      group: button,
      background,
      label,
      preparation,
    });

    card.add(button);
    this.group.add(card);
  }

  private resetCursor(): void {
    const stage = this.group.getStage();
    if (stage) {
      stage.container().style.cursor = "default";
    }
  }
}