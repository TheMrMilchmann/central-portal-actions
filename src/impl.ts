import * as core from "@actions/core";
import {paths} from "./lib/central-publisher-api/v1";
import createClient, {FetchResponse, Middleware} from "openapi-fetch";

export interface PortalRequestOptions {
    baseUrl: string,
    username: string,
    password: string,
    timeoutMs?: number,
}

export default async function portalPublisherRequest<
    P extends keyof paths,
    Method extends keyof paths[P],
    T extends Record<string | number, any> & paths[P][Method],
    Options = undefined,
    Media extends `${string}/${string}` = "application/json"
>(
    requestOptions: PortalRequestOptions,
    rq: (client: ReturnType<typeof createClient<paths>>) => Promise<FetchResponse<T, Options, Media>>
): Promise<NonNullable<FetchResponse<T, Options, Media>['data']>> {
    const client = createClient<paths>({
        baseUrl: requestOptions.baseUrl,
        headers: {
            Authorization: "Bearer " + Buffer.from(requestOptions.username + ":" + requestOptions.password).toString("base64")
        }
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        core.info("Request timeout exceeded. Signalling abort...");
        controller.abort();
    }, requestOptions.timeoutMs ?? 45_000);

    const middleware = createMiddleware(controller.signal);
    client.use(middleware);

    try {
        const {data, response} = await rq(client);
        if (!response.ok) {
            throw new Error(`Central Publisher API request was unsuccessful. Central Publisher API returned ${response.status} (${response.statusText}) [url=${response.url}].`);
        }

        return data as unknown as NonNullable<FetchResponse<T, Options, Media>['data']>;
    } finally {
        clearTimeout(timeout);
        client.eject(middleware);
    }
}

function createMiddleware(signal: AbortSignal | undefined): Middleware {
    return {
        onRequest({request}): Request {
            core.info(`Calling Portal Publisher API: ${request.url}`);

            if (!signal) return request;
            return new Request(request, {
                signal: signal
            });
        }
    };
}
