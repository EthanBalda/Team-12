import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH} from "../../constants.ts";

export class ResultScreenView implements View {
  private group: Konva.Group;
  private success_group: Konva.Group;
  private loss_group: Konva.Group;

  constructor(
    onContinue: () => void,
    onNewGame: () => void,
  ) {
    this.group = new Konva.Group({visible: false});
    this.success_group = new Konva.Group({ visible: false });
    this.loss_group = new Konva.Group({visible: false});

    this.group.add(new Konva.Text({
        x: 0,
        y: 25,
        width: STAGE_WIDTH,
        text: "Game Results",
        fontSize: 30,
        fontFamily: "Arial",
        fontStyle: "bold",
        fill: "#14245E",
        align: "center",
    }))

    this.success_group.add(new Konva.Rect({
        x: (STAGE_WIDTH - 460) / 2,
        y: 70,
        width: 460,
        height: 570,
        fill: "#E5FAF3",
        stroke: "#DCE5DF",
        strokeWidth: 1,
        cornerRadius: 24,
    }))



    this.success_group.add(new Konva.Text({
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


    const success_imageObj = new Image();
    success_imageObj.onload = () => {
    const home = new Konva.Image({
        x: (STAGE_WIDTH - 106) / 2,
        y: 170,
        image: success_imageObj,
        width: 106,
        height: 118,
    });

    this.success_group.add(home);
    this.success_group.getLayer()?.draw();
    };
    success_imageObj.src = '/house-1-rd.png';


    this.success_group.add(new Konva.Text({
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


    this.success_group.add(new Konva.Text({
        x: 0,
        y: 365,
        width: STAGE_WIDTH,
        text: "10 years survived",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }));

    this.success_group.add(new Konva.Text({
        x: 0,
        y: 405,
        width: STAGE_WIDTH,
        text: "Peak population  1,240",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }));

    this.success_group.add(new Konva.Text({
        x: 0,
        y: 445,
        width: STAGE_WIDTH,
        text: "Avg pollution  21%",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }));

    this.addButton(
        this.success_group,
        "Continue Playing",
        (STAGE_WIDTH - 360) / 2,
        490,
        360,
        50,
        "#00B5A5",
        onContinue,
    );

    this.addButton(
      this.success_group,
      "Play Again",
      (STAGE_WIDTH - 360) / 2,
      560,
      360,
      50,
      "#59636E",
      onNewGame,
    );

    this.loss_group.add(new Konva.Rect({
        x: (STAGE_WIDTH - 460) / 2,
        y: 70,
        width: 460,
        height: 570,
        fill: "#FDEAE1",
        stroke: "#E5DDD7",
        strokeWidth: 1,
        cornerRadius: 24,
    }))

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 100,
        width: STAGE_WIDTH,
        text: "Loss",
        fontSize: 50,
        fontFamily: "Arial",
        fontStyle: "bold",
        fill: "#00B5A5",
        align: "center",
    }))

    const loss_imageObj = new Image();
    loss_imageObj.onload = () =>{
        const home = new Konva.Image({
            x:(STAGE_WIDTH - 106) / 2,
            y: 170,
            image: loss_imageObj,
            width: 106,
            height: 118,
        })

        this.loss_group.add(home);
        this.loss_group.getLayer()?.draw();
    };
    loss_imageObj.src = "/0098-clip-art-m.png";

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 310,
        width: STAGE_WIDTH,
        text: "Your city was abandoned",
        fontSize: 30,
        fontFamily: "Arial",
        fontStyle: "bold",
        fill: "black",
        align: "center",
    }));

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 365,
        width: STAGE_WIDTH,
        text: "Population reached 0",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }))

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 405,
        width: STAGE_WIDTH,
        text: "Your choices shape the planet",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }))

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 445,
        width: STAGE_WIDTH,
        text: "Try a different strategy",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }))

    this.loss_group.add(new Konva.Text({
        x: 0,
        y: 490,
        width: STAGE_WIDTH,
        text: "Balance growth with clean energy",
        fontSize: 20,
        fontFamily: "Arial",
        fill: "#14245E",
        align: "center",
    }))

    this.addButton(
      this.loss_group,
      "Try Again",
      (STAGE_WIDTH - 360) / 2,
      560,
      360,
      50,
      "#59636E",
      onNewGame,
    );

    this.group.add(this.success_group);
    this.group.add(this.loss_group);
    

};

private addButton(
        parent: Konva.Group,
        label: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        onClick: () => void,
      ): void {
        const button = new Konva.Group({ x, y });
    
        button.add(new Konva.Rect({
          width,
          height,
          fill: color,
          cornerRadius: 10,
        }));
    
        button.add(new Konva.Text({
          width,
          height,
          text: label,
          fontSize: 19,
          fontFamily: "Arial",
          fontStyle: "bold",
          fill: "white",
          align: "center",
          verticalAlign: "middle",
        }));
    
        button.on("click tap", onClick);
        button.on("mouseenter", () => {
          button.getStage()?.container().style.setProperty(
            "cursor",
            "pointer",
          );
        });
        button.on("mouseleave", () => {
          button.getStage()?.container().style.setProperty(
            "cursor",
            "default",
          );
        });
    
        parent.add(button);
      }


  show(): void {
    this.group.show();
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.hide();
    this.group.getLayer()?.draw();
  }

  show_result(is_success: boolean): void{
    this.success_group.visible(is_success);
    this.loss_group.visible(!is_success);
    this.group.show();
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}