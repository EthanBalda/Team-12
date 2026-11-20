
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateWorldScreenView } from "../../../screens/CreateWorldScreen/CreateWorldScreenView";

describe("CreateWorldScreenView", () => {
    let parent: HTMLDivElement;
    let onSubmit: ReturnType<typeof vi.fn<(worldId: string, password: string) => void>>;
    let onLogin: ReturnType<typeof vi.fn<() => void>>;
    let onGoBack: ReturnType<typeof vi.fn<() => void>>;
    let view: CreateWorldScreenView;

    beforeEach(() => {
        parent = document.createElement("div");
        onSubmit = vi.fn<(worldId: string, password: string) => void>();
        onLogin = vi.fn<() => void>();
        onGoBack = vi.fn<() => void>();

        view = new CreateWorldScreenView(
            onSubmit,
            onLogin,
            onGoBack,
            parent,
        );
    });

    it("renders the create world screen", () => {
        view.show();

        expect(parent.querySelector(".create-world-screen")).not.toBeNull();
        expect(parent.querySelector("h1")?.textContent).toBe("Re:Planet");
        expect(parent.querySelector("h2")?.textContent).toBe("Create A New Game");
    });

    it("renders the introductory text", () => {
        view.show();

        expect(
            parent.querySelector(".registration-card p")?.textContent,
        ).toBe("Register to be able to create a new game.");
    });

    it("renders the world ID and password inputs", () => {
        view.show();

        expect(parent.querySelector('input[name="worldId"]')).not.toBeNull();
        expect(parent.querySelector('input[name="password"]')).not.toBeNull();
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

        parent.querySelector("form")!.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            }),
        );

        expect(onSubmit).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledWith("my-world", "password123");
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

        expect(onSubmit).toHaveBeenCalledWith("my-world", "password123");
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

    it("calls onLogin when the login link is clicked", () => {
        view.show();

        const loginLink = parent.querySelector<HTMLAnchorElement>(
            ".login-link",
        )!;

        loginLink.click();

        expect(onLogin).toHaveBeenCalledOnce();
    });

    it("prevents the default login link behaviour", () => {
        view.show();

        const loginLink = parent.querySelector<HTMLAnchorElement>(
            ".login-link",
        )!;

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        loginLink.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("renders a back button", () => {
        view.show();

        const backButton = parent.querySelector<HTMLButtonElement>(
            ".back-button",
        );

        expect(backButton).not.toBeNull();
        expect(backButton?.type).toBe("button");
        expect(backButton?.textContent).toBe("← Back");
    });

    it("calls onGoBack when the back button is clicked", () => {
        view.show();

        const backButton = parent.querySelector<HTMLButtonElement>(
            ".back-button",
        )!;

        backButton.click();

        expect(onGoBack).toHaveBeenCalledOnce();
    });

    it("prevents the default back button behaviour", () => {
        view.show();

        const backButton = parent.querySelector<HTMLButtonElement>(
            ".back-button",
        )!;

        const event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        backButton.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it("displays an error message", () => {
        view.show();

        view.setError("Something went wrong");

        expect(parent.querySelector(".form-error")?.textContent).toBe(
            "Something went wrong",
        );
    });

    it("clears the error message", () => {
        view.show();

        view.setError("Something went wrong");
        view.setError("");

        expect(parent.querySelector(".form-error")?.textContent).toBe("");
    });

    it("disables the submit button when loading", () => {
        view.show();

        view.setLoading(true);

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(true);
        expect(button.textContent).toBe("Creating...");
    });

    it("enables the submit button when loading finishes", () => {
        view.show();

        view.setLoading(true);
        view.setLoading(false);

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(false);
        expect(button.textContent).toBe("Create");
    });

    it("hides the screen", () => {
        view.show();

        expect(parent.querySelector(".create-world-screen")).not.toBeNull();

        view.hide();

        expect(parent.querySelector(".create-world-screen")).toBeNull();
    });

    it("does not add duplicate screens when show is called twice", () => {
        view.show();
        view.show();

        expect(
            parent.querySelectorAll(".create-world-screen").length,
        ).toBe(1);
    });
});
