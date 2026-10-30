import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

export class ResultScreenView implements View {
  private group: Konva.Group;

  constructor(
    onContinue: () => void,
    onNewGame: () => void,
  ) {
    this.group = new Konva.Group({ visible: false });

    // Next: add the success message and buttons here.

    this.group.add(new Konva.Text({
        x: 0,
        y: 100,
        width: STAGE_WIDTH,
        text: "Success",
        fontSize: 50,
        fontFamily: "Arial",
        fontStyle: "bold",
        fill: "#00B5A5",
        align: "center",
    }))

    const imageObj = new Image();
    imageObj.onload = () => {
    const home = new Konva.Image({
        x: (STAGE_WIDTH - 106) / 2,
        y: 170,
        image: imageObj,
        width: 106,
        height: 118,
    });

    this.group.add(home);
    this.group.getLayer()?.draw();
    };
    imageObj.src = '/house-1-rd.png';

    this.group.add(new Konva.Text({
        x: 0,
        y: 310,
        width: STAGE_WIDTH,
        text: "City established",
        fontSize: 30,
        fontFamily: "Arial",
        fontStyle: "bold",
        fill: "black",
        align: "center",
    }));

    

};


  show(): void {
    this.group.show();
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.hide();
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}