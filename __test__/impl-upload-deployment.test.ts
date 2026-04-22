import { vi, afterAll, beforeAll, beforeEach, test, expect } from "vitest";
vi.stubGlobal("fetch", vi.fn());

import uploadDeployment from "../src/impl-upload-deployment.js";

vi.mock("node:fs", async (importOriginal) => ({
    ...await importOriginal<typeof import("node:fs")>(),
    openAsBlob: vi.fn().mockResolvedValue(new Blob([""]))
}));

const DEPLOYMENT_ID = "28570f16-da32-4c14-bd2e-c1acc0782365";
const BASE_URL = "https://example.com";
const AUTH_PARAMS = {
    baseUrl: BASE_URL,
    username: "user",
    password: "pass"
};

beforeAll(() => {
    vi.useFakeTimers();
});

beforeEach(() => {
    vi.mocked(fetch).mockReset();
    vi.clearAllMocks();
});

afterAll(() => {
    // Restore real timers after all tests in this file
    vi.useRealTimers();
});

test("Success: Uploads and gets VALIDATED status on first poll", async () => {
    vi.mocked(fetch)
        // First response for POST /api/v1/publisher/upload
        .mockResolvedValueOnce(new Response(DEPLOYMENT_ID, { status: 201 }))
        // Second response for POST /api/v1/publisher/status
        .mockResolvedValueOnce(new Response(JSON.stringify({ deploymentState: "VALIDATED" }), { status: 200 }));

    const uploadPromise = uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Deployment",
        "USER_MANAGED",
        600
    );

    // Advance timers to trigger the first polling call
    await vi.advanceTimersByTimeAsync(10_000);

    const deploymentId = await uploadPromise;

    // Assertions
    expect(deploymentId).toEqual(DEPLOYMENT_ID);
    expect(fetch).toHaveBeenCalledTimes(2);

    // Check the first call (upload)
    const uploadCall = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(uploadCall.url).toEqual("https://example.com/api/v1/publisher/upload?name=My%20Deployment&publishingType=USER_MANAGED");
    expect(uploadCall.method).toEqual("POST");

    // Check the second call (status)
    const statusCall = vi.mocked(fetch).mock.calls[1][0] as Request;
    expect(statusCall.url).toEqual(`https://example.com/api/v1/publisher/status?id=${DEPLOYMENT_ID}`);
    expect(statusCall.method).toEqual("POST");
});

test("Failure: Throws error if deployment FAILED", async () => {
    vi.mocked(fetch)
        // First response for POST /upload
        .mockResolvedValueOnce(new Response(DEPLOYMENT_ID, { status: 201 }))
        // Second response for POST /status
        .mockResolvedValueOnce(new Response(JSON.stringify({ deploymentState: "FAILED" }), { status: 200 }));

    // noinspection ES6MissingAwait
    vi.advanceTimersByTimeAsync(10_000);

    // We expect the promise to reject. Wrap the timer advancement in the check.
    await expect(uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Failing Deployment",
        "AUTOMATIC",
        600
    )).rejects.toThrow();

    // Assert that the network calls were made
    expect(fetch).toHaveBeenCalledTimes(2);
});

test("Failure: Throws error on initial upload (e.g., 401 Unauthorized)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Unauthorized Deployment",
        "USER_MANAGED",
        600
    )).rejects.toThrow();

    // Assert that only one network call was attempted
    expect(fetch).toHaveBeenCalledTimes(1);
});
