import { readFile } from "fs/promises";
import { toAbsoluteSoftwarePath } from "./utils.js";

const CONFIG_FILENAME = "config.json";
const DEFAULT_CONFIG = {
    blackList: [],
};

async function loadConfig() {
    try {
        const content = await readFile(toAbsoluteSoftwarePath(CONFIG_FILENAME), "utf8");
        return JSON.parse(content);
    } catch {
        return DEFAULT_CONFIG;
    }
}

export {
    loadConfig,
};
