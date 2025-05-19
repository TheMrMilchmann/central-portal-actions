import fetchMock, {enableFetchMocks} from "jest-fetch-mock";
enableFetchMocks();

import dropDeployment from "../src/impl-drop-deployment";

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

test("Success: should call the correct URL with DELETE and resolve without error", async () => {
    // Arrange: Mock a successful response (204 No Content)
    fetchMock.mockResponse("", { status: 204 });

    // Act: Call the function and wait for it to complete
    await dropDeployment(AUTH_PARAMS, DEPLOYMENT_ID);

    // Assert: Check that fetch was called correctly
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Get the Request object that fetch was called with
    const request = fetchMock.mock.calls[0][0] as Request;

    // Check the URL and method of the Request object
    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("DELETE");
});

test("Unauthorized: should throw an error when receiving a 401 status", async () => {
    // Arrange: Mock an unauthorized response
    fetchMock.mockResponse("", { status: 401 });

    // Act & Assert: Check that the promise rejects (an error is thrown)
    await expect(dropDeployment(AUTH_PARAMS, DEPLOYMENT_ID)).rejects.toThrow();

    // Assert: Verify that the fetch attempt was still made correctly
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toEqual(EXPECTED_URL);
    expect(request.method).toEqual("DELETE");
});
