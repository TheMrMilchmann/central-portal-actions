import * as core from "@actions/core";
import * as constants from "../constants";
import dropDeployment from "../impl-drop-deployment";

async function run(): Promise<void> {
    try {
        const baseUrl = core.getInput(constants.INPUT_BASE_URL, { required: true });
        const username = core.getInput(constants.INPUT_USERNAME, { required: true });
        const password = core.getInput(constants.INPUT_PASSWORD, { required: true });

        const deploymentId = core.getInput(constants.INPUT_DEPLOYMENT_ID, { required: true });

        if (deploymentId.length == 0) {
            core.setFailed("Deployment ID may not be empty");
            return;
        }

        await dropDeployment(
            {
                baseUrl: baseUrl,
                username: username,
                password: password
            },
            deploymentId
        );

        core.info(`Successfully dropped deployment (${deploymentId}).`);
    } catch (error) {
        core.setFailed(`${(error as any)?.message ?? error}`);
    }
}

// noinspection JSIgnoredPromiseFromCall
run();
