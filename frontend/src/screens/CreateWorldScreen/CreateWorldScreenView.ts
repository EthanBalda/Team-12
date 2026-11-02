
import type { ScreenView } from "../../types.ts";

export class CreateWorldScreenView implements ScreenView{
	private root: HTMLDivElement;
    private onSubmit: (worldId: string, password: string) => void;
    private parent: HTMLElement;


	constructor(
		onSubmit: (worldId: string, password: string) => void,
		parent: HTMLElement,
	) {
        this.onSubmit = onSubmit;
        this.parent = parent;

		this.root = document.createElement("div");
		this.root.className = "create-world-screen";

		this.root.innerHTML = `
			<section class="registration-card">
				<h1>Re:Planet</h1>
				<h2>Create A New Game</h2>
				<p>Register to be able to create a new game.</p>

				<form>
					<input
						name="worldId"
						type="text"
						placeholder="World ID"
						autocomplete="username"
						required
					/>

					<input
						name="password"
						type="password"
						placeholder="Password"
						autocomplete="new-password"
						required
					/>

					<p class="form-error" role="alert"></p>

					<button type="submit">Create</button>
				</form>

				<p class="login-prompt">
					Already have an account?
					<a href="#" class="login-link">Login here.</a>
				</p>
			</section>
		`;

		const form = this.root.querySelector("form")!;

		form.addEventListener("submit", (event) => {
			event.preventDefault();

			const data = new FormData(form);
			const worldId = String(data.get("worldId") ?? "").trim();
			const password = String(data.get("password") ?? "");

			this.onSubmit(worldId, password);
		});
	}

	show(): void {
		if (!this.root.isConnected) {
			this.parent.appendChild(this.root);
		}
	}

	hide(): void {
		this.root.remove();
	}

	setError(message: string): void {
		const error = this.root.querySelector(".form-error");
		if (error) error.textContent = message;
	}

	setLoading(loading: boolean): void {
		const button = this.root.querySelector<HTMLButtonElement>(
			'button[type="submit"]',
		);

		if (button) {
			button.disabled = loading;
			button.textContent = loading ? "Creating..." : "Create";
		}
	}
}
