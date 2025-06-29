import fetchMock, {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import uploadDeployment from "../src/impl-upload-deployment";

import * as fs from "node:fs";
jest.mock("node:fs", () => ({
    ...jest.requireActual("node:fs"),
    promises: {
        ...jest.requireActual("node:fs").promises,
        access: jest.fn().mockResolvedValue(undefined),
    },
    readFileSync: jest.fn().mockResolvedValue("[STUB]")
}));

const DEPLOYMENT_ID = "28570f16-da32-4c14-bd2e-c1acc0782365";
const BASE_URL = "https://example.com";
const AUTH_PARAMS = {
    baseUrl: BASE_URL,
    username: "user",
    password: "pass"
};

beforeAll(() => {
    jest.useFakeTimers();
});

beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();

    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from("dummy bundle content"));
});

afterAll(() => {
    // Restore real timers after all tests in this file
    jest.useRealTimers();
});

test("Success: Uploads and gets VALIDATED status on first poll", async () => {
    fetchMock.mockResponses(
        // First response for POST /api/v1/publisher/upload
        [DEPLOYMENT_ID, { status: 201 }],
        // Second response for POST /api/v1/publisher/status
        [JSON.stringify({ deploymentState: "VALIDATED" }), { status: 200 }]
    );

    const uploadPromise = uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Deployment",
        "USER_MANAGED",
        600
    );

    // Advance timers to trigger the first polling call
    await jest.advanceTimersByTimeAsync(10_000);

    const deploymentId = await uploadPromise;

    // Assertions
    expect(deploymentId).toEqual(DEPLOYMENT_ID);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Check the first call (upload)
    const uploadCall = fetchMock.mock.calls[0][0] as Request;
    expect(uploadCall.url).toEqual("https://example.com/api/v1/publisher/upload?name=My%20Deployment&publishingType=USER_MANAGED");
    expect(uploadCall.method).toEqual("POST");

    // Check the second call (status)
    const statusCall = fetchMock.mock.calls[1][0] as Request;
    expect(statusCall.url).toEqual(`https://example.com/api/v1/publisher/status?id=${DEPLOYMENT_ID}`);
    expect(statusCall.method).toEqual("POST");
});

test("Failure: Throws error if deployment FAILED", async () => {
    fetchMock.mockResponses(
        // First response for POST /upload
        [DEPLOYMENT_ID, { status: 201 }],
        // Second response for POST /status
        [JSON.stringify({ deploymentState: "FAILED" }), { status: 200 }]
    );

    // noinspection ES6MissingAwait
    jest.advanceTimersByTimeAsync(10_000);

    // We expect the promise to reject. Wrap the timer advancement in the check.
    await expect(uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Failing Deployment",
        "AUTOMATIC",
        600
    )).rejects.toThrow();

    // Assert that the network calls were made
    expect(fetchMock).toHaveBeenCalledTimes(2);
});

test("Failure: Throws error on initial upload (e.g., 401 Unauthorized)", async () => {
    // Mock a single failure response for the first call
    fetchMock.mockResponse("", { status: 401 });

    await expect(uploadDeployment(
        AUTH_PARAMS,
        "/fake/path/bundle.zip",
        "My Unauthorized Deployment",
        "USER_MANAGED",
        600
    )).rejects.toThrow();

    // Assert that only one network call was attempted
    expect(fetchMock).toHaveBeenCalledTimes(1);
});
