
import type { ScreenView } from "../../types.ts";

export class LoginWorldScreenView implements ScreenView {
    private root: HTMLDivElement;
    private onSubmit: (worldId: string, password: string) => void;
    private onRegister: () => void;
    private parent: HTMLElement;

    constructor(
        onSubmit: (worldId: string, password: string) => void,
        onRegister: () => void,
        parent: HTMLElement,
    ) {
        this.onSubmit = onSubmit;
        this.onRegister = onRegister;
        this.parent = parent;

        this.root = document.createElement("div");
        this.root.className = "login-world-screen";

        this.root.innerHTML = `
            <section class="registration-card">
                <h1>Re:Planet</h1>
                <h2>Login for an Existing Game</h2>
                <p>Login to be able to resume an existing game.</p>

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
                        autocomplete="current-password"
                        required
                    />

                    <p class="form-error" role="alert"></p>

                    <button type="submit">Login</button>
                </form>

                <p class="registration-prompt">
                    Don't have an account?
                    <a href="#" class="login-link">Register here.</a>
                </p>
            </section>
        `;

        const loginForm = this.root.querySelector("form")!;

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const data = new FormData(loginForm);
            const worldId = String(data.get("worldId") ?? "").trim();
            const password = String(data.get("password") ?? "");

            this.onSubmit(worldId, password);
        });

        const registerLink = this.root.querySelector(".login-link")!;

        registerLink.addEventListener("click", (event) => {
            event.preventDefault();
            this.onRegister();
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
            button.textContent = loading ? "Logging in..." : "Login";
        }
    }
}
