
export class InstructionsScreenModel {
    readonly title = "How To Play";

    readonly instructions =
    "Welcome to Re:Planet!\n\n" +
    "Your goal is to grow your city's population while keeping " +
    "pollution below 100. If pollution reaches 100, the game ends. " +
    "You must survive and develop your city over ten years.\n\n" +

    "BUILDING YOUR CITY\n\n" +
    "You can build different types of buildings to increase your " +
    "population. Each building has its own cost, pollution impact " +
    "and population increase, so choose carefully!\n\n" +
    "Your city is divided into four districts: North, South, East " +
    "and West. To build, click on the district where you want to " +
    "place a building. Once the district is highlighted, select " +
    "a building and click Build.\n\n" +

    "WEATHER EVENTS\n\n" +
    "At the end of each year, a random weather event will target " +
    "one of your four districts and may cause damage. After " +
    "clicking End Year, a popup will explain the event. You can " +
    "choose to buy protective equipment to help protect the " +
    "affected district. Remember that protection costs money!\n\n" +

    "EARNING MONEY\n\n" +
    "You can play minigames at any point during the year to earn " +
    "more money. Use your money wisely to build new buildings " +
    "and purchase protective equipment.\n\n" +

    "PROGRESSING THROUGH THE GAME\n\n" +
    "When you are ready to move forward, click End Year. This " +
    "will trigger a weather event and allow you to prepare for " +
    "its effects before progressing to the next year.\n\n" +

    "LEAVING AND RESUMING\n\n" +
    "You can leave your game at any time by clicking Logout. " +
    "You can log back in later to resume your progress.\n\n" +

    "WINNING THE GAME\n\n" +
    "The game lasts ten years. At the end of the tenth year, " +
    "your city will be evaluated to determine whether you have " +
    "passed or failed. Grow your population, manage your money " +
    "and keep pollution below 100!\n\n" +

    "Good luck, and build a sustainable future in Re:Planet!";

    readonly backButtonText = "Go Back";

    readonly colors = {
        background: "rgba(10, 48, 55, 0.65)",
        modal: "rgba(255, 255, 255, 0.95)",
        primary: "#00b9a5",
        primaryHover: "#009f90",
        secondary: "#14265d",
        text: "#14265d",
        white: "#ffffff"
    };

    readonly modalWidth = 700;
    readonly modalHeight = 500;

    readonly buttonWidth = 220;
    readonly buttonHeight = 58;
}
