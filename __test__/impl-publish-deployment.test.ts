import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import publishDeployment from "../src/impl-publish-deployment";

const DEPLOYMENT_ID = "28570f16-da32-4c14-bd2e-c1acc0782365";
const BASE_URL = "https://example.com";
const EXPECTED_URL = `${BASE_URL}/api/v1/publisher/deployment/${DEPLOYMENT_ID}`;
const AUTH_PARAMS = {
    baseUrl: BASE_URL,
    username: "user",
    password: "pass"
};

beforeEach(() => {
    fetchMock.resetMocks();
});

test("Success: should call the correct URL with POST ", async () => {
    // Arrange: Mock a successful response
    fetchMock.mockResponse("", { status: 204 });

    // Act: Call the function
    await publishDeployment(
        AUTH_PARAMS,
        DEPLOYMENT_ID
    );

    // Assert: Verify the fetch call details
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const request = fetchMock.mock.calls[0][0] as Request;

    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("POST");
    expect(request.body).toEqual(null);
});

test("Unauthorized: should throw an error when receiving a 401 status", async () => {
    // Arrange: Mock an unauthorized response
    fetchMock.mockResponse("", { status: 401 });

    // Act & Assert: Check that the function call rejects with an error
    await expect(publishDeployment(
        AUTH_PARAMS,
        DEPLOYMENT_ID
    )).rejects.toThrow();

    // Assert: Verify the fetch call was still made correctly
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const request = fetchMock.mock.calls[0][0] as Request;

    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("POST");
    expect(request.body).toEqual(null);
});
