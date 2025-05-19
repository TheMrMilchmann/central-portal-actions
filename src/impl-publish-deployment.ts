import portalPublisherRequest, {PortalRequestOptions} from "./impl";

export default async function publishDeployment(
    requestOptions: PortalRequestOptions,
    deploymentId: string
): Promise<void> {
    return portalPublisherRequest(requestOptions, client =>
        client.POST("/api/v1/publisher/deployment/{deploymentId}", {
            params: {
                path: { deploymentId: deploymentId }
            }
        })
    );
}
