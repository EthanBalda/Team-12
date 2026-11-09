export type Bin = "recycling" | "compost" | "trash";

export interface SortItem {
    name: string;   // "Banana peel"
    bin: Bin;       // the correct bin
    tip: string;    // "Food scraps go in compost."
}

export const BINS: Bin[] = ["recycling", "compost", "trash"];

export const SORT_ITEMS: SortItem[] = [
    // recycling
    { name: "Plastic bottle", bin: "recycling", tip: "Empty plastic bottles go in recycling." },
    { name: "Aluminum can", bin: "recycling", tip: "Aluminum can be recycled over and over." },
    { name: "Newspaper", bin: "recycling", tip: "Clean paper goes in recycling." },
    { name: "Cardboard box", bin: "recycling", tip: "Flatten cardboard and recycle it." },
    { name: "Glass jar", bin: "recycling", tip: "Rinsed glass jars go in recycling." },
    { name: "Soup can", bin: "recycling", tip: "Steel cans are recyclable once rinsed." },

    // compost
    { name: "Banana peel", bin: "compost", tip: "Fruit scraps break down in compost." },
    { name: "Apple core", bin: "compost", tip: "Food scraps go in compost." },
    { name: "Coffee grounds", bin: "compost", tip: "Coffee grounds add nutrients to compost." },
    { name: "Eggshells", bin: "compost", tip: "Eggshells break down in compost." },
    { name: "Grass clippings", bin: "compost", tip: "Yard waste goes in compost." },
    { name: "Vegetable scraps", bin: "compost", tip: "Vegetable scraps go in compost." },

    // trash
    { name: "Chip bag", bin: "trash", tip: "Chip bags mix foil and plastic, so they go in the trash." },
    { name: "Foam cup", bin: "trash", tip: "Foam cups can't be recycled in most cities." },
    { name: "Candy wrapper", bin: "trash", tip: "Candy wrappers are too mixed to recycle." },
    { name: "Plastic straw", bin: "trash", tip: "Straws are too small for recycling machines." },
    { name: "Diaper", bin: "trash", tip: "Diapers go in the trash." },
    { name: "Broken mug", bin: "trash", tip: "Ceramics can't be recycled with glass." },
];
