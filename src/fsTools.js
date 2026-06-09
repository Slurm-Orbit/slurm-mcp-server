import { readdir } from "fs/promises";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { toAbsoluteSoftwarePath } from "./utils.js";
import { z } from "zod";
import { Tool } from "./utils.js";
import { logger } from "./logger.js";

async function getSlurmTemplateFiles() {
    const templateDir = toAbsoluteSoftwarePath("templates");
    const files = await readdir(templateDir);
    const filenames = files.filter(file => file.endsWith(".slurm"));
    return filenames.map(file => file.replace(".slurm", ""));
}

async function getSlurmTemplateContent(name) {
    const templateDir = toAbsoluteSoftwarePath("templates");
    const file = await readFile(path.join(templateDir, name + ".slurm"), "utf8");
    return file;
}

async function getSlurmTemplateFile({ name }) {
    var content;
    try {
        content = await getSlurmTemplateContent(name);
    } catch {
        content = "";
    }
    return {
        type: "text",
        text: content,
    };
}

const getSlurmTemplateFileTool = new Tool(
    "get-slurm-template-file",
    "Get a Slurm template file, The slurm file content should be based on the template, you can only append the content to the template, not modify the template.",
    z.object({
        name: z.enum(await getSlurmTemplateFiles()).describe("The name of the template." ),
    }),
    getSlurmTemplateFile,
);
async function listSlurmFiles() {
    const files = await readdir(process.cwd());
    const slurmFiles = files.filter(file => file.endsWith(".slurm"));
    return {
        type: "text",
        text: slurmFiles.join("\n"),
    };
}

const listSlurmFilesTool = new Tool(
    "list-slurm-files",
    "List all Slurm files in the current directory",
    z.object({}),
    listSlurmFiles,
);

async function createSlurmFile({ filename, content }) {
    if (!filename.endsWith(".slurm")) {
        filename += ".slurm";
    }
    await writeFile(path.join(process.cwd(), filename), content);
    logger.info(`Slurm file created successfully: ${filename}`);
    return {
        type: "text",
        text: "Slurm file created successfully: " + filename,
    };
}

const createSlurmFileTool = new Tool(
    "create-slurm-file",
    "Create a Slurm file",
    z.object({
        filename: z.string().describe("The name of the Slurm file, the filename should have the .slurm extension, e.g. job.slurm"),
        content: z.string().describe("The content of the Slurm file"),
    }),
    createSlurmFile,
);

export { getSlurmTemplateFileTool, listSlurmFilesTool, createSlurmFileTool };