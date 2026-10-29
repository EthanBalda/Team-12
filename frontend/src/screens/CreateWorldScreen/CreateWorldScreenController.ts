
import { BACKEND_API_ENDPOINT } from "../../constants.ts";
import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher, ScreenView } from "../../types.ts";
import { CreateWorldScreenView } from "./CreateWorldScreenView.ts";

export class CreateWorldScreenController extends ScreenController {
	private view: CreateWorldScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(
		screenSwitcher: ScreenSwitcher,
		parent: HTMLElement,
	) {
		super();

		this.screenSwitcher = screenSwitcher;

		this.view = new CreateWorldScreenView(
			(worldId, password) => {
				void this.handleCreateWorld(worldId, password);
			},
			parent,
		);
	}
    getView(): ScreenView {
        return this.view;
    }
	private async handleCreateWorld(
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
			const response = await fetch(`${BACKEND_API_ENDPOINT}/worlds/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				worldID: worldId,
				password: password,
			}),
			});

			if (!response.ok) {
			throw new Error(`Failed to create world: ${response.status}`);
			}
            this.screenSwitcher.switchToScreen({type: "mainGame"})
		} catch {
			this.view.setError(
				"Could not create your world. Please try again.",
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
