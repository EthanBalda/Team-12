import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CreateWorldScreenController } from "../../../screens/CreateWorldScreen/CreateWorldScreenController";
import { BACKEND_API_ENDPOINT } from "../../../constants";

describe("CreateWorldScreenController", () => {
    let parent: HTMLDivElement;

    let screenSwitcher: { switchToScreen: ReturnType<typeof vi.fn>; };

    let controller: CreateWorldScreenController;

    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        parent = document.createElement("div");

        screenSwitcher = {
            switchToScreen: vi.fn(),
        };

        fetchMock = vi.fn();

        vi.stubGlobal("fetch", fetchMock);

        controller = new CreateWorldScreenController(screenSwitcher as any, parent);

        controller.show();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    function submitForm(worldId: string, password: string) {
        const worldIdInput = parent.querySelector<HTMLInputElement>('input[name="worldId"]')!;

        const passwordInput = parent.querySelector<HTMLInputElement>('input[name="password"]')!;

        worldIdInput.value = worldId;
        passwordInput.value = password;

        const form = parent.querySelector("form")!;

        form.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true,
            })
        );
    }

    it("creates a world successfully", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 201,
        });

        submitForm("test-world", "password123");

        await vi.waitFor(() => {
            expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
                type: "mainGame",
            });
        });

        expect(fetchMock).toHaveBeenCalledOnce();

        expect(fetchMock).toHaveBeenCalledWith(
            `${BACKEND_API_ENDPOINT}/worlds/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    worldID: "test-world",
                    password: "password123",
                }),
            }
        );
    });

    it("does not create a world when the world ID is empty", () => {
        submitForm("", "password123");

        expect(fetchMock).not.toHaveBeenCalled();

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();

        expect(parent.querySelector(".form-error")?.textContent).toBe("Please fill in both fields.");
    });

    it("does not create a world when the password is empty", () => {
        submitForm("test-world", "");
        expect(fetchMock).not.toHaveBeenCalled();
        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
        expect(parent.querySelector(".form-error")?.textContent).toBe("Please fill in both fields.");
    });

    it("displays an error when the backend returns an unsuccessful response", async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 409,
        });

        submitForm("test-world", "password123");

        await vi.waitFor(() => {
            expect(parent.querySelector(".form-error")?.textContent).toBe("Could not create your world. Please try again.");
        });

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("handles network errors", async () => {
        fetchMock.mockRejectedValue(new Error("Network error"));

        submitForm("test-world", "password123");

        await vi.waitFor(() => { 
            expect(parent.querySelector(".form-error")?.textContent).toBe("Could not create your world. Please try again.");
        });

        expect(screenSwitcher.switchToScreen).not.toHaveBeenCalled();
    });

    it("disables the button while the request is pending", async () => {
        let resolveFetch!: (value: { ok: boolean; status: number }) => void;

        fetchMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveFetch = resolve;
                })
        );

        submitForm("test-world", "password123");

        const button = parent.querySelector<HTMLButtonElement>('button[type="submit"]')!;

        expect(button.disabled).toBe(true);
        expect(button.textContent).toBe("Creating...");

        resolveFetch({
            ok: true,
            status: 201,
        });

        await vi.waitFor(() => {
            expect(button.disabled).toBe(false);
            expect(button.textContent).toBe("Create");
        });
    });

    it("hides the screen", () => {
        expect(parent.querySelector(".create-world-screen")).not.toBeNull();

        controller.hide();

        expect(parent.querySelector(".create-world-screen")).toBeNull();
    });
});