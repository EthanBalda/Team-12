
export class StartScreenModel {
    readonly title = "Re:Planet";
    readonly subtitle = "Build a new home";
    readonly description = "Learn about climate change";

    readonly buttons = [
        "Start a new game",
        "Continue an existing game",
        "How to play"
    ];

    readonly colors = {
        background: "#849b8b",
        modal: "rgba(255, 255, 255, 0.95)",
        primary: "#00b9a5",
        primaryHover: "#009f90",
        secondary: "#14265d",
        text: "#14265d",
        white: "#ffffff"
    };

    readonly modalWidth = 620;
    readonly modalHeight = 560;

    readonly buttonWidth = 420;
    readonly buttonHeight = 62;
    readonly buttonGap = 20;
}
