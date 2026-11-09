
import { BACKEND_API_ENDPOINT } from "../../constants.ts";
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher, ScreenView } from "../../types.ts";
import { LoginWorldScreenView } from "./LoginWorldScreenView.ts";

export class LoginWorldScreenController extends ScreenController {
    private view: LoginWorldScreenView;
    private screenSwitcher: ScreenSwitcher;

    constructor(
        screenSwitcher: ScreenSwitcher,
        parent: HTMLElement,
    ) {
        super();

        this.screenSwitcher = screenSwitcher;

        this.view = new LoginWorldScreenView(
            (worldId, password) => {
                void this.handleLoginWorld(worldId, password);
            },
            () => {
                this.screenSwitcher.switchToScreen({
                    type: "createWorld",
                });
            },
            parent,
        );
    }

    getView(): ScreenView {
        return this.view;
    }

    private async handleLoginWorld(
        worldId: string,
        password: string,
    ): Promise<void> {
        this.view.setError("");

        if (!worldId || !password) {
            this.view.setError("Please fill in both fields.");
            return;
        }

        this.view.setLoading(true);

        try {
            const response = await fetch(
                `${BACKEND_API_ENDPOINT}/worlds/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        worldID: worldId,
                        password: password,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to login to world: ${response.status}`,
                );
            }

            this.screenSwitcher.switchToScreen({ type: "mainGame" });
        } catch {
            this.view.setError(
                "Could not login to your world. Please try again.",
            );
        } finally {
            this.view.setLoading(false);
        }
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }
}
