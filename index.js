#! /usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  getSlurmTemplateFileTool, listSlurmFilesTool, createSlurmFileTool 
} from "./src/fsTools.js";
import {
  submitSlurmJobTool, cancelJobTool, getClusterInfoTool, listSlurmJobsTool, getFinishedJobsTool
} from "./src/slurmTools.js";

const server = new McpServer({
  name: "slurm-mcp-server",
  version: "0.0.1",
});

getSlurmTemplateFileTool.registerTo(server);
cancelJobTool.registerTo(server);
listSlurmFilesTool.registerTo(server);
createSlurmFileTool.registerTo(server);
submitSlurmJobTool.registerTo(server);
getClusterInfoTool.registerTo(server);
listSlurmJobsTool.registerTo(server);
getFinishedJobsTool.registerTo(server);

await server.connect(new StdioServerTransport());