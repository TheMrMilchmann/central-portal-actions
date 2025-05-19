import centralPublisherRequest, {PortalRequestOptions} from "./impl";
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

    const fileBuffer = fs.readFileSync(bundle);
    const fileBlob = new Blob([fileBuffer]);
    const fileName = path.basename(bundle);

    formData.append("bundle", fileBlob, fileName);

    const deploymentId = await centralPublisherRequest(requestOptions, client =>
        client.POST("/api/v1/publisher/upload", {
            params: {
                query: {
                    name: name,
                    publishingType: publishingType
                }
            },
            body: formData as any
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
                core.error(error);
            }
            throw new Error(`Deployment failed validation: ${deploymentId}`);
        }
    } while ((Date.now() - transitionStartTime) < (validationTimeout * 1_000));

    return deploymentId;
}
