import { z } from "zod";
import {
    getSlurmQueueInfo, cancelSlurmJob, submitSlurmJob, getSlurmClusterInfo, getSlurmJobInfo,
    updateSlurmNodeState
} from "slurmjs";
import { loadConfig } from "./config.js";
import { Tool, runWithErrorHandling } from "./utils.js";
import { logger } from "./logger.js";
import os from 'os';

const configure = await loadConfig();
const username = os.userInfo().username;

async function getClusterInfo() {
    return runWithErrorHandling("Failed to get cluster information", async () => {
        const partitions = await getSlurmClusterInfo();
        return JSON.stringify(partitions, null, 0);
    });
}

const getClusterInfoTool = new Tool(
    "get-cluster-info",
    "Get the cluster information",
    z.object({}),
    getClusterInfo,
);

async function cancelJob({ jobId, reason, confirm }) {
    if (configure.blackList.includes("cancelJob")) {
        return {
            type: "text",
            text: "Job cancellation is not allowed",
        };
    }
    if (!confirm) {
        return {
            type: "text",
            text: "Job cancellation is not confirmed",
        };
    }
    return runWithErrorHandling("Job cancellation failed", async () => {
        await cancelSlurmJob(jobId);
        logger.info(`Job ${jobId} cancelled by ${reason}`);
        return "Job cancelled successfully";
    });
}

const cancelJobTool = new Tool(
    "cancel-job",
    "Cancel a Slurm job",
    z.object({
        jobId: z.number().describe("The ID of the job to cancel"),
        reason: z.string().describe("The reason for cancelling the job"),
        confirm: z.boolean().describe("Whether to confirm the cancellation"),
    }),
    cancelJob,
);

async function listSlurmJobs() {
    return runWithErrorHandling("Failed to get Slurm jobs", async () => {
        const jobs = await getSlurmQueueInfo();
        const userJobs = jobs.filter(job => job.user === username);
        return JSON.stringify(userJobs, null, 0);
    });
}

const listSlurmJobsTool = new Tool(
    "list-slurm-jobs",
    "List the Slurm jobs of the current user",
    z.object({}),
    listSlurmJobs,
);

async function submitJob({ jobFile }) {
    if (configure.blackList.includes("submitJob")) {
        return {
            type: "text",
            text: "Job submission is not allowed",
        };
    }
    return runWithErrorHandling("Job submission failed", async () => {
        const jobId = await submitSlurmJob(jobFile);
        logger.info(`Job submitted successfully: ${jobId}`);
        return "Job submitted successfully with job ID: " + jobId;
    });
}

const submitSlurmJobTool = new Tool(
    "submit-slurm-job",
    "Submit a Slurm job",
    z.object({
        jobFile: z.string().describe("The path to the Slurm job file"),
    }),
    submitJob
);

async function getFinishedJobs({ option, id }) {
    return runWithErrorHandling("Failed to get finished Slurm jobs", async () => {
        const jobs = await getSlurmJobInfo();
        const finishedJobs = jobs.filter(job =>
            job.user === username && !job.status.includes("RUNNING")
        );

        if (option === "all") {
            return JSON.stringify(finishedJobs, null, 0);
        }
        if (option === "id") {
            const job = finishedJobs.find(job => job.jobId === id);
            return job ? JSON.stringify(job, null, 0) : "Job not found";
        }

        const recentJobs = finishedJobs.slice(0, 3);
        const hint = finishedJobs.length > 3
            ? ` and other ${finishedJobs.length - 3} jobs`
            : "";
        return JSON.stringify(recentJobs, null, 0) + hint;
    });
}

const getFinishedJobsTool = new Tool(
    "get-slurm-finished-jobs",
    "Get the finished Slurm jobs",
    z.object({
        option: z.enum(["all", "id"]).optional().describe(
            "The option to get the finished Slurm jobs. When omitted, the 3 most recent jobs are returned."
        ),
        id: z.number().describe(
            "The ID of the job to get the finished Slurm jobs, required when option is id"
        ).optional(),
    }),
    getFinishedJobs,
);

async function updateNodeState({ nodeName, state, reason, confirm }) {
    if (configure.blackList.includes("updateNodeState")) {
        return {
            type: "text",
            text: "Node state update is not allowed",
        };
    }
    if (!confirm) {
        return {
            type: "text",
            text: "Node state update is not confirmed",
        };
    }
    return runWithErrorHandling("Failed to update node state", async () => {
        await updateSlurmNodeState(nodeName, state);
        logger.info(`Node ${nodeName} state updated to ${state} by ${reason}`);
        return `Node ${nodeName} state updated to ${state}`;
    });
}

const updateNodeStateTool = new Tool(
    "update-node-state",
    "Update the state of a cluster node, e.g. DRAIN, RESUME, DOWN or IDLE. Requires administrator privileges.",
    z.object({
        nodeName: z.string().describe(
            "The name of the node, node list expressions such as node[01-03] are supported"
        ),
        state: z.string().describe("The target state, e.g. IDLE, DOWN, DRAIN, RESUME"),
        reason: z.string().describe("The reason for updating the node state"),
        confirm: z.boolean().describe("Whether to confirm the state update"),
    }),
    updateNodeState,
);

export {
    cancelJobTool, listSlurmJobsTool, submitSlurmJobTool, getClusterInfoTool, getFinishedJobsTool,
    updateNodeStateTool
};
