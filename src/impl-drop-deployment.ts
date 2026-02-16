import portalPublisherRequest, {PortalRequestOptions} from "./impl.js";

export default async function dropDeployment(
    requestOptions: PortalRequestOptions,
    deploymentId: string
): Promise<void> {
    return portalPublisherRequest(requestOptions, client =>
        client.DELETE("/api/v1/publisher/deployment/{deploymentId}", {
            params: {
                path: { deploymentId: deploymentId }
            }
        })
    );
}
