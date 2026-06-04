import { readdir } from "fs/promises";
import { writeFile } from "fs/promises";
import path from "path";

async function listFiles() {
    const files = await readdir(process.cwd());
    return {
        type: "text",
        text: files.join("\n"),
    };
}
async function createFile({ name, content }) {
    await writeFile(path.join(process.cwd(), name), content);
    return {
        type: "text",
        text: "File created successfully",
    };
}
async function listSlurmJobs() {
}
export { listFiles, createFile };