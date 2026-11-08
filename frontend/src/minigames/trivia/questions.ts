export type Difficulty = "easy" | "medium" | "hard";

export interface TriviaQuestion {
    question: string;
    choices: string[];    
    answerIndex: number;  
    explanation: string;  
    difficulty: Difficulty;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
    // easy
    {
        question: "Which of these is a renewable energy source?",
        choices: ["Coal", "Natural gas", "Solar", "Oil"],
        answerIndex: 2,
        explanation: "Sunlight keeps arriving every day. Coal, gas and oil took millions of years to form and run out once burned.",
        difficulty: "easy",
    },
    {
        question: "Which gas do trees take in from the air?",
        choices: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
        answerIndex: 0,
        explanation: "Trees use carbon dioxide to make food through photosynthesis and release oxygen.",
        difficulty: "easy",
    },
    {
        question: "Where should an empty aluminum can go?",
        choices: ["Trash", "Compost", "Yard waste", "Recycling"],
        answerIndex: 3,
        explanation: "Aluminum can be recycled over and over without losing quality.",
        difficulty: "easy",
    },
    {
        question: "Which light bulb uses the least energy?",
        choices: ["Incandescent", "LED", "Halogen", "They all use the same"],
        answerIndex: 1,
        explanation: "LED bulbs use at least 75% less energy than incandescent bulbs and last much longer.",
        difficulty: "easy",
    },
    {
        question: "Which way of getting to work causes the least pollution?",
        choices: ["Driving alone", "Taking a taxi", "Riding a bike", "Riding a motorcycle"],
        answerIndex: 2,
        explanation: "A bike burns no fuel, so it releases no exhaust.",
        difficulty: "easy",
    },

    // medium
    {
        question: "Which greenhouse gas is released most when fossil fuels are burned?",
        choices: ["Methane", "Carbon dioxide", "Ozone", "Hydrogen"],
        answerIndex: 1,
        explanation: "Burning coal, oil and gas turns their carbon into carbon dioxide, which traps heat in the atmosphere.",
        difficulty: "medium",
    },
    {
        question: "About how much of Earth's water is fresh water?",
        choices: ["3%", "25%", "50%", "75%"],
        answerIndex: 0,
        explanation: "About 97% of Earth's water is salt water. Most of the fresh water is frozen in glaciers and ice caps.",
        difficulty: "medium",
    },
    {
        question: "Why do cities plant trees along streets?",
        choices: ["To block traffic", "To cool streets and clean the air", "To make roads wider", "To attract more cars"],
        answerIndex: 1,
        explanation: "Shade and water evaporating from leaves lower street temperatures, and leaves trap some air pollution.",
        difficulty: "medium",
    },
    {
        question: "What is a green roof?",
        choices: ["A roof painted green", "A roof made of recycled metal", "A roof covered with plants", "A roof with solar panels"],
        answerIndex: 2,
        explanation: "Plants on a roof soak up rainwater, insulate the building and cool the air around it.",
        difficulty: "medium",
    },
    {
        question: "What does carbon neutral mean?",
        choices: [
            "Releasing no more carbon dioxide than is removed",
            "Using only coal for power",
            "Never using electricity",
            "Planting one tree per person",
        ],
        answerIndex: 0,
        explanation: "A carbon neutral city balances the carbon dioxide it releases by cutting emissions and removing the rest, for example with forests.",
        difficulty: "medium",
    },

    // hard
    {
        question: "Rotting waste in landfills releases a gas that traps over 80 times more heat than carbon dioxide over 20 years. Which gas?",
        choices: ["Nitrogen", "Oxygen", "Hydrogen", "Methane"],
        answerIndex: 3,
        explanation: "Food and other waste break down without oxygen in landfills and release methane.",
        difficulty: "hard",
    },
    {
        question: "What is the urban heat island effect?",
        choices: [
            "Cities being hotter than the land around them",
            "Islands built for power plants",
            "Heat from volcanoes under cities",
            "Cities cooling down at night",
        ],
        answerIndex: 0,
        explanation: "Pavement and buildings absorb heat during the day and release it slowly, so cities stay warmer than nearby rural areas.",
        difficulty: "hard",
    },
    {
        question: "Which food takes the most water to produce per pound?",
        choices: ["Wheat", "Potatoes", "Beef", "Apples"],
        answerIndex: 2,
        explanation: "A pound of beef takes roughly 1,800 gallons of water, mostly to grow the animals' feed.",
        difficulty: "hard",
    },
    {
        question: "What is the largest source of electricity in the United States?",
        choices: ["Coal", "Nuclear", "Solar", "Natural gas"],
        answerIndex: 3,
        explanation: "Natural gas makes about 40% of US electricity. It releases about half the carbon dioxide of coal, but it is still a fossil fuel.",
        difficulty: "hard",
    },
    {
        question: "Which sector releases the most greenhouse gases in the United States?",
        choices: ["Transportation", "Agriculture", "Homes", "Retail stores"],
        answerIndex: 0,
        explanation: "Cars, trucks and planes have been the largest source of US greenhouse gas emissions in recent years.",
        difficulty: "hard",
    },
];