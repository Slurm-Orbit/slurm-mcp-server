import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createFile, listFiles } from "./src/tools.js";
import { wrapToolResult } from "./src/utils.js";
import { execSync } from 'child_process';

// 1. 创建 Server 实例
const server = new McpServer({
  name: "slurm-mcp-server",
  version: "0.0.1",
});

server.registerTool(
  "list-files",
  {
    description: "列出当前目录下的所有文件",
  },
  wrapToolResult(listFiles)
);

server.registerTool(
  "create-file",
  {
    description: "创建一个新文件",
    inputSchema: {
      name: z.string().describe("文件名"),
      content: z.string().describe("文件内容"),
    },
  },
  wrapToolResult(createFile)
);

server.registerTool(
  "list-slurm-jobs",
  {
    description: "列出当前 Slurm 集群中的所有作业",
  },
  wrapToolResult(() => {execSync("squeue")})
);

server.registerTool(
  "submit-job",
  {
    description: "提交一个新作业",
    inputSchema: {
      script: z.string().describe("作业脚本"),
    },
  },
  wrapToolResult(({ script }) => {execSync(`sbatch ${script}`)})
);

await server.connect(new StdioServerTransport());