import type {CityState} from "./cityState.js";

export function advanceYear(city: CityState): CityState{
    if (!Number.isInteger(city.year) || city.year < 1){
        throw new Error("Invalid city year");
    }




    return{
        ...city, 
        year: city.year + 1,
    };
}