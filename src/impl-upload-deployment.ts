import centralPublisherRequest, {PortalRequestOptions} from "./impl.js";
import * as core from "@actions/core";
import * as fs from "node:fs";
import * as path from "node:path";

interface DeploymentStatusResponse {
    deploymentId: string,
    deploymentName: string,
    deploymentState: string,
    purls: [],
    errors: {}
}

export default async function uploadDeployment(
    requestOptions: PortalRequestOptions,
    bundle: string,
    name: string | undefined,
    publishingType: "USER_MANAGED" | "AUTOMATIC",
    validationTimeout: number
): Promise<string> {
    const formData = new FormData();

    const fileName = path.basename(bundle);
    const contentType = fileName.endsWith("tgz") || fileName.endsWith(".tar.gz") ? "application/gzip" : undefined;
    const file = await fs.openAsBlob(bundle, { type: contentType });
    formData.append("bundle", file, fileName);

    const deploymentId = await centralPublisherRequest(requestOptions, client =>
        client.POST("/api/v1/publisher/upload", {
            params: {
                query: {
                    name: name,
                    publishingType: publishingType
                }
            },
            body: formData as any,
            parseAs: "text"
        })
    );

    const transitionStartTime = Date.now();

    do {
        await new Promise(r => setTimeout(r, 10_000));

        let response = await centralPublisherRequest(requestOptions, client => client.POST(`/api/v1/publisher/status`, {
                params: {
                    query: {"id": deploymentId}
                }
            })
        ) as unknown as DeploymentStatusResponse;

        if (response.deploymentState == "VALIDATED"
            || response.deploymentState == "PUBLISHING"
            || response.deploymentState == "PUBLISHED"
        ) {
            core.info("Deployment successfully validated.");
            break; // We're happy
        } else if (response.deploymentState == "FAILED") {
            for (const error in response.errors) {
                core.error(`Validation error: ${error}`);
            }
            throw new Error(`Deployment failed validation: ${deploymentId}`);
        }
    } while ((Date.now() - transitionStartTime) < (validationTimeout * 1_000));

    return deploymentId;
}
