import { vi, beforeEach, test, expect } from "vitest";
vi.stubGlobal("fetch", vi.fn());

import publishDeployment from "../src/impl-publish-deployment.js";

const DEPLOYMENT_ID = "28570f16-da32-4c14-bd2e-c1acc0782365";
const BASE_URL = "https://example.com";
const EXPECTED_URL = `${BASE_URL}/api/v1/publisher/deployment/${DEPLOYMENT_ID}`;
const AUTH_PARAMS = {
    baseUrl: BASE_URL,
    username: "user",
    password: "pass"
};

beforeEach(() => {
    vi.mocked(fetch).mockReset();
});

test("Success: should call the correct URL with POST", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await publishDeployment(AUTH_PARAMS, DEPLOYMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(1);

    const request = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("POST");
    expect(request.body).toEqual(null);
});

test("Unauthorized: should throw an error when receiving a 401 status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 401 }));

    await expect(publishDeployment(AUTH_PARAMS, DEPLOYMENT_ID)).rejects.toThrow();

    expect(fetch).toHaveBeenCalledTimes(1);

    const request = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("POST");
    expect(request.body).toEqual(null);
});
