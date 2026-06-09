import path from "path";
import { env } from "process";
function wrapToolResult(func) {
    return async (args) => {
        const result = await func(args);
        return {
            content: [
                result
            ]
        }
    }
}

function toAbsoluteSoftwarePath(relativePath){
    const homeDir = env.HOME;
    const softwareDir = path.join(homeDir, ".slurm-mcp");
    const absolutePath = path.join(softwareDir, relativePath);
    return absolutePath;
}

class Tool {
    constructor(name, description, inputSchema, func) {
        this.name = name;
        this.description = description;
        this.inputSchema = inputSchema;
        this.func = func;
    }

    registerTo(server) {
        server.registerTool(
            this.name,
            {
                description: this.description,
                inputSchema: this.inputSchema,
            },
            wrapToolResult(this.func)
        );
    }
}
export { Tool, toAbsoluteSoftwarePath };