
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vitest";

import { LoginWorldScreenController } from "../../../screens/LoginWorldScreen/LoginWorldScreenController";
import { BACKEND_API_ENDPOINT } from "../../../constants";

describe("LoginWorldScreenController", () => {
    let parent: HTMLDivElement;

    let screenSwitcher: {
        switchToScreen: ReturnType<typeof vi.fn>;
    };

    let controller: LoginWorldScreenController;

    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        parent = document.createElement("div");

        screenSwitcher = {
            switchToScreen: vi.fn(),
        };

        fetchMock = vi.fn();

        vi.stubGlobal("fetch", fetchMock);

        controller = new LoginWorldScreenController(
            screenSwitcher as any,
            parent,
        );

        controller.show();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    function submitForm(worldId: string, password: string) {
        const worldIdInput = parent.querySelector<HTMLInputElement>(
            'input[name="worldId"]',
        )!;

        const passwordInput = parent.querySelector<HTMLInputElement>(
            'input[name="password"]',
        )!;

        worldIdInput.value = worldId;
        passwordInput.value = password;

        const form = parent.querySelector("form")!;

        form.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            }),
        );
    }

    it("logs into an existing world successfully", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
        });

        submitForm("test-world", "password123");

        await vi.waitFor(() => {
            expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
                type: "loadGame",
            });
        });

        expect(fetchMock).toHaveBeenCalledOnce();

        expect(fetchMock).toHaveBeenCalledWith(
            `${BACKEND_API_ENDPOINT}/worlds/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    worldID: "test-world",
                    password: "password123",
                }),
            },
        );
    });

    it("does not login when the world ID is empty", () => {
        submitForm("", "password123");

        expect(fetchMock).not.toHaveBeenCalled();

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();

        expect(parent.querySelector(".form-error")?.textContent).toBe(
            "Please fill in both fields.",
        );
    });

    it("does not login when the password is empty", () => {
        submitForm("test-world", "");

        expect(fetchMock).not.toHaveBeenCalled();

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();

        expect(parent.querySelector(".form-error")?.textContent).toBe(
            "Please fill in both fields.",
        );
    });

    it("does not login when both fields are empty", () => {
        submitForm("", "");

        expect(fetchMock).not.toHaveBeenCalled();

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();

        expect(parent.querySelector(".form-error")?.textContent).toBe(
            "Please fill in both fields.",
        );
    });

    it("displays an error when the backend returns an unsuccessful response", async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 401,
        });

        submitForm("test-world", "wrong-password");

        await vi.waitFor(() => {
            expect(parent.querySelector(".form-error")?.textContent).toBe(
                "Could not login to your world. Please try again.",
            );
        });

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("handles network errors", async () => {
        fetchMock.mockRejectedValue(new Error("Network error"));

        submitForm("test-world", "password123");

        await vi.waitFor(() => {
            expect(parent.querySelector(".form-error")?.textContent).toBe(
                "Could not login to your world. Please try again.",
            );
        });

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("disables the button while the login request is pending", async () => {
        let resolveFetch!: (value: {
            ok: boolean;
            status: number;
        }) => void;

        fetchMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveFetch = resolve;
                }),
        );

        submitForm("test-world", "password123");

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(true);
        expect(button.textContent).toBe("Logging in...");

        resolveFetch({
            ok: true,
            status: 200,
        });

        await vi.waitFor(() => {
            expect(button.disabled).toBe(false);
            expect(button.textContent).toBe("Login");
        });
    });

    it("re-enables the button when the login request fails", async () => {
        fetchMock.mockRejectedValue(new Error("Network error"));

        submitForm("test-world", "password123");

        const button = parent.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        )!;

        expect(button.disabled).toBe(true);
        expect(button.textContent).toBe("Logging in...");

        await vi.waitFor(() => {
            expect(button.disabled).toBe(false);
            expect(button.textContent).toBe("Login");
        });
    });

    it("clears a previous error when a new submission is made", async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 401,
        });

        submitForm("test-world", "wrong-password");

        await vi.waitFor(() => {
            expect(parent.querySelector(".form-error")?.textContent).toBe(
                "Could not login to your world. Please try again.",
            );
        });

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
        });

        submitForm("test-world", "correct-password");

        expect(parent.querySelector(".form-error")?.textContent).toBe("");

        await vi.waitFor(() => {
            expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
                type: "loadGame",
            });
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("navigates to the create world screen when registration is clicked", () => {
        const registerLink = parent.querySelector<HTMLAnchorElement>(
            ".login-link",
        )!;

        registerLink.click();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledOnce();

        expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
            type: "createWorld",
        });
    });

    it("hides the screen", () => {
        expect(
            parent.querySelector(".login-world-screen"),
        ).not.toBeNull();

        controller.hide();

        expect(
            parent.querySelector(".login-world-screen"),
        ).toBeNull();
    });

    it("shows the screen", () => {
        controller.hide();
        controller.show();

        expect(
            parent.querySelector(".login-world-screen"),
        ).not.toBeNull();
    });
});
