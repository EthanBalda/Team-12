
import { BACKEND_API_ENDPOINT } from "./constants.ts";

export interface World {
    worldID: string;
    authenticated: boolean;
}

export async function checkLogin(): Promise<boolean> {
    try {
        const response = await fetch(
            `${BACKEND_API_ENDPOINT}/worlds/me`,
            {
                method: "GET",
                credentials: "include",
            },
        );

        if (!response.ok) {
            return false;
        }

        const world: World = await response.json();

        return true;
    } catch (error) {
        console.error("Authentication check failed:", error);
        return false;
    }
}
