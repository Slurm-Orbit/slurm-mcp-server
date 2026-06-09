import { describe, expect, test } from "bun:test";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
    test("reads config from the expected path", async () => {
        const config = await loadConfig();
        expect(config).toEqual({
            blackList: []
        });
    });
});
