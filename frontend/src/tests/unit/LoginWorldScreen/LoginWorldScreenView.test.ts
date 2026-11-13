
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from "vitest";

import { LoginWorldScreenView } from "../../../screens/LoginWorldScreen/LoginWorldScreenView";

describe("LoginWorldScreenView", () => {
    let parent: HTMLDivElement;

    let onSubmit: ReturnType<typeof vi.fn<(worldId: string, password: string) => void>>;

    let onRegister: ReturnType<typeof vi.fn<() => void>>;

    let view: LoginWorldScreenView;

    beforeEach(() => {
        parent = document.createElement("div");

        onSubmit = vi.fn<(worldId: string, password: string) => void>();

        onRegister = vi.fn<() => void>();


        view = new LoginWorldScreenView(
            onSubmit,
            onRegister,
            parent,
        );
    });

    it("renders the login world screen", () => {
        view.show();

        expect(
            parent.querySelector(".login-world-screen"),
        ).not.toBeNull();

        expect(parent.querySelector("h1")?.textContent).toBe(
            "Re:Planet",
        );

        expect(parent.querySelector("h2")?.textContent).toBe(
            "Login for an Existing Game",
        );
    });

    it("renders the introductory text", () => {
        view.show();

        expect(
            parent.querySelector(".registration-card p")?.textContent,
        ).toBe("Login to be able to resume an existing game.");
    });

    it("renders the world ID and password inputs", () => {
        view.show();

        expect(
            parent.querySelector('input[name="worldId"]'),
        ).not.toBeNull();

        expect(
            parent.querySelector('input[name="password"]'),
        ).not.toBeNull();
    });

    it("renders the correct input attributes", () => {
        view.show();

        const worldIdInput = parent.querySelector<HTMLInputElement>(
            'input[name="worldId"]',
        )!;

        const passwordInput = parent.querySelector<HTMLInputElement>(
            'input[name="password"]',
        )!;

        expect(worldIdInput.type).toBe("text");
        expect(worldIdInput.placeholder).toBe("World ID");
        expect(worldIdInput.autocomplete).toBe("username");
        expect(worldIdInput.required).toBe(true);

        expect(passwordInput.type).toBe("password");
        expect(passwordInput.placeholder).toBe("Password");
        expect(passwordInput.autocomplete).toBe("current-password");
        expect(passwordInput.required).toBe(true);
    });

    it("renders a login submit button", () => {
        view.show();

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button).not.toBeNull();
        expect(button.textContent).toBe("Login");
    });

    it("calls onSubmit when the form is submitted", () => {
        view.show();

        const worldIdInput = parent.querySelector<HTMLInputElement>(
            'input[name="worldId"]',
        )!;

        const passwordInput = parent.querySelector<HTMLInputElement>(
            'input[name="password"]',
        )!;

        worldIdInput.value = "my-world";
        passwordInput.value = "password123";

        const form = parent.querySelector("form")!;

        form.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(onSubmit).toHaveBeenCalledOnce();

        expect(onSubmit).toHaveBeenCalledWith(
            "my-world",
            "password123",
        );
    });

    it("trims whitespace from the world ID", () => {
        view.show();

        const worldIdInput = parent.querySelector<HTMLInputElement>(
            'input[name="worldId"]',
        )!;

        const passwordInput = parent.querySelector<HTMLInputElement>(
            'input[name="password"]',
        )!;

        worldIdInput.value = "  my-world  ";
        passwordInput.value = "password123";

        parent.querySelector("form")!.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(onSubmit).toHaveBeenCalledWith(
            "my-world",
            "password123",
        );
    });

    it("does not trim whitespace from the password", () => {
        view.show();

        const worldIdInput = parent.querySelector<HTMLInputElement>(
            'input[name="worldId"]',
        )!;

        const passwordInput = parent.querySelector<HTMLInputElement>(
            'input[name="password"]',
        )!;

        worldIdInput.value = "my-world";
        passwordInput.value = "  password123  ";

        parent.querySelector("form")!.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(onSubmit).toHaveBeenCalledWith(
            "my-world",
            "  password123  ",
        );
    });

    it("prevents the default form submission behaviour", () => {
        view.show();

        const form = parent.querySelector("form")!;

        const event = new Event("submit", {
            bubbles: true,
            cancelable: true,
        });

        form.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("calls onRegister when the registration link is clicked", () => {
        view.show();

        const registerLink = parent.querySelector<HTMLAnchorElement>(
            ".login-link",
        )!;

        registerLink.click();

        expect(onRegister).toHaveBeenCalledOnce();
    });

    it("prevents the default registration link behaviour", () => {
        view.show();

        const registerLink = parent.querySelector<HTMLAnchorElement>(
            ".login-link",
        )!;

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        registerLink.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("displays an error message", () => {
        view.show();

        view.setError("Something went wrong");

        expect(
            parent.querySelector(".form-error")?.textContent,
        ).toBe("Something went wrong");
    });

    it("clears the error message", () => {
        view.show();

        view.setError("Something went wrong");
        view.setError("");

        expect(
            parent.querySelector(".form-error")?.textContent,
        ).toBe("");
    });

    it("renders the error message with the alert role", () => {
        view.show();

        expect(
            parent.querySelector('.form-error[role="alert"]'),
        ).not.toBeNull();
    });

    it("disables the submit button when loading", () => {
        view.show();

        view.setLoading(true);

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(true);
        expect(button.textContent).toBe("Logging in...");
    });

    it("enables the submit button when loading finishes", () => {
        view.show();

        view.setLoading(true);
        view.setLoading(false);

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(false);
        expect(button.textContent).toBe("Login");
    });

    it("hides the screen", () => {
        view.show();

        expect(
            parent.querySelector(".login-world-screen"),
        ).not.toBeNull();

        view.hide();

        expect(
            parent.querySelector(".login-world-screen"),
        ).toBeNull();
    });

    it("does not add duplicate screens when show is called twice", () => {
        view.show();
        view.show();

        expect(
            parent.querySelectorAll(".login-world-screen").length,
        ).toBe(1);
    });
});
