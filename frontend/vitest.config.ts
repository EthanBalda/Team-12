import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: [
            "src/tests/**/*.test.ts",
            "src/weather/**/*.test.ts",
            "src/screens/MainGameScreen/**/*.test.ts"
        ],
        clearMocks: true,
        restoreMocks: true
    }
});