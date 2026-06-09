import { z } from "zod";
import {
    getSlurmJobInfo, cancelSlurmJob, submitSlurmJob, getSlurmClusterInfo, getFinishedSlurmJobInfo
} from "slurmjs";
import { loadConfig } from "./config.js";
import { Tool } from "./utils.js";
import { logger } from "./logger.js";
import os from 'os';

const configure = await loadConfig();
const username = os.userInfo().username;

async function getClusterInfo() {
    const res = await getSlurmClusterInfo();
    if (res.success) {
        return {
            type: "text",
            text: JSON.stringify(res.data, null, 0),
        };
    }
    return {
        type: "text",
        text: "Failed to get cluster information",
    };
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
    const res = await cancelSlurmJob(jobId);
    if (res.success) {
        logger.info(`Job ${jobId} cancelled by ${reason}`);
        return {
            type: "text",
            text: "Job cancelled successfully",
        };
    }
    return {
        type: "text",
        text: "Job cancellation failed: " + (res.error ?? "unknown error"),
    };
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
    const jobs = await getSlurmJobInfo({u: username});
    if (jobs.success) {
        return {
            type: "text",
            text: JSON.stringify(jobs.data, null, 0),
        };
    }
    else {
        return {
            type: "text",
            text: "Failed to get Slurm jobs",
        };
    }
}

const listSlurmJobsTool = new Tool(
    "list-slurm-jobs",
    "List all Slurm jobs",
    z.object({}),
    listSlurmJobs,
);

async function submitJob({ jobFile }) {
    const res = await submitSlurmJob(jobFile);
    if (res.success) {
        logger.info(`Job submitted successfully: ${res.data}`);
        return {
            type: "text",
            text: "Job submitted successfully with job ID: " + res.data,
        };
    }
    return {
        type: "text",
        text: "Job submission failed: " + (res.error ?? "unknown error"),
    };
}

const submitSlurmJobTool = new Tool(
    "submit-slurm-job",
    "Submit a Slurm job",
    z.object({
        jobFile: z.string().describe("The path to the Slurm job file"),
    }),
    submitJob
);

async function getFinishedJobs({option, id}) {
    const jobs = await getFinishedSlurmJobInfo({u: username});
    if (jobs.success) {
        var res;
        var hint = "";
        if (option == "all") {
            res = jobs.data;
        }
        else if (option == "id") {
            res = jobs.data.find(job => job.id === id) ?? {
                type: "text",
                text: "Job not found",
            };
        }
        else {
            res = jobs.data.slice(0, 3);
            hint = ` and other ${jobs.data.length - 3} jobs`;
        }

        return {
            type: "text",
            text: JSON.stringify(res, null, 0) + hint,
        };
    }
    else {
        return {
            type: "text",
            text: "Failed to get finished Slurm jobs: " + (jobs.error ?? "unknown error"),
        };
    }
}

const getFinishedJobsTool = new Tool(
    "get-slurm-finished-jobs",
    "Get the finished Slurm jobs",
    z.object({
        option: z.enum(["all", "id"]).describe("The option to get the finished Slurm jobs"),
        id: z.number().describe(
            "The ID of the job to get the finished Slurm jobs, when option is all, this parameter can be omitted"
        ).optional(),
    }),
    getFinishedJobs,
);

export { cancelJobTool, listSlurmJobsTool, submitSlurmJobTool, getClusterInfoTool, getFinishedJobsTool };