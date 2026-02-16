import * as core from "@actions/core";
import * as constants from "../constants";
import uploadDeployment from "../impl-upload-deployment";

async function run() {
    function parsePublishingType(): "AUTOMATIC" | "USER_MANAGED" {
        switch (core.getInput(constants.INPUT_PUBLISHING_TYPE, { required: true })) {
            case "automatic": return "AUTOMATIC";
            case "user-managed": return "USER_MANAGED";
            default: throw new Error(`Publishing type must be one of: "automatic", "user-managed"`);
        }
    }

    try {
        const username = core.getInput(constants.INPUT_USERNAME, { required: true });
        const password = core.getInput(constants.INPUT_PASSWORD, { required: true });
        const baseUrl = core.getInput(constants.INPUT_BASE_URL, { required: true });

        const bundle = core.getInput(constants.INPUT_BUNDLE, { required: true });
        const name = core.getInput(constants.INPUT_NAME);
        const publishingType = parsePublishingType();
        const validationTimeout = parseInt(core.getInput(constants.INPUT_VALIDATION_TIMEOUT, { required: true }));

        if (name && name.length == 0) {
            core.setFailed("Name may not be empty");
            return;
        }

        if (isNaN(validationTimeout)) {
            core.setFailed(`Transition timeout is not a valid number: ${validationTimeout}`);
            return;
        }

        const deploymentId = await uploadDeployment(
            {
                baseUrl: baseUrl,
                username: username,
                password: password,
            },
            bundle,
            name,
            publishingType,
            validationTimeout
        );

        core.info(`Successfully created deployment (${deploymentId}).`);
        core.setOutput(constants.OUTPUT_DEPLOYMENT_ID, deploymentId);
    } catch (error) {
        core.setFailed(`${(error as any)?.message ?? error}`);
    }
}

// noinspection JSIgnoredPromiseFromCall
run();
