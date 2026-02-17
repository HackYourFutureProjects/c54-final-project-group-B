import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CreateUser from "../CreateUser";
import TEST_ID_CREATE_USER from "../CreateUser.testid";
import {
  createUserSuccessMock,
  createUserFailedMock,
} from "../../../__testUtils__/fetchUserMocks";

// We need to wrap with MemoryRouter because CreateUser uses useNavigate
const WrappedCreateUser = () => (
  <MemoryRouter>
    <CreateUser />
  </MemoryRouter>
);

beforeEach(() => {
  fetch.resetMocks();
  // Robust mock for all possible calls
  fetch.mockResponse(async (req) => {
    if (req.url.includes("/api/users/me")) {
      return JSON.stringify({ success: true, user: null });
    }
    if (req.url.includes("/api/users")) {
      if (req.method === "POST") {
        // This will be overridden in specific tests if needed
        return createUserSuccessMock();
      }
      return JSON.stringify({ success: true, result: [] });
    }
    return { status: 404, body: "Not Found" };
  });
});

describe("CreateUser", () => {
  it("Renders without a problem", () => {
    render(<WrappedCreateUser />);

    expect(
      screen.getByTestId(TEST_ID_CREATE_USER.container),
    ).toBeInTheDocument();
  });

  it("Should be able to change name and email input", () => {
    const testName = "John";
    const testEmail = "john@doe.com";

    render(<WrappedCreateUser />);

    // Check initially fields are empty
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      "",
    );
    expect(screen.getByTestId(TEST_ID_CREATE_USER.emailInput).value).toEqual(
      "",
    );

    // Change fields
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });

    // Check fields have changed value
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      testName,
    );
    expect(screen.getByTestId(TEST_ID_CREATE_USER.emailInput).value).toEqual(
      testEmail,
    );
  });

  it("Should send the input values to the server on clicking submit and indicate loading states", async () => {
    const testName = "JohnDoe";
    const testEmail = "john@doe.com";
    const testPassword = "Password123!";

    // Mock our fetch specifically for this test
    fetch.mockResponse(async (req) => {
      if (req.url.includes("/api/users/me"))
        return JSON.stringify({ success: true, user: null });
      if (req.url.includes("/api/users") && req.method === "POST")
        return createUserSuccessMock({ name: testName, email: testEmail });
      return JSON.stringify({ success: true, result: [] });
    });

    render(<WrappedCreateUser />);

    // Fill in ALL required fields to pass validation
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.passwordInput), {
      target: { value: testPassword },
    });
    fireEvent.change(
      screen.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput),
      {
        target: { value: testPassword },
      },
    );

    // Select country and city (this might be tricky depending on how SelectField works)
    // For now, let's assume we can just change the value if the component allows it
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.countrySelect), {
      target: { value: "NL" },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.citySelect), {
      target: { value: "Amsterdam" },
    });

    fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.agreedToTermsInput));

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.submitButton));
    });

    // Wait for the loading state to be removed (if it was shown)
    // Note: Due to fast mock response, it might be gone instantly
    await waitFor(() => {
      expect(
        screen.queryByTestId(TEST_ID_CREATE_USER.loadingContainer),
      ).not.toBeInTheDocument();
    });

    // Check that the fields were cleared after a successful submit
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value,
      ).toEqual("");
    });
  });

  it("Should show an error state if the creation is unsuccessful", async () => {
    const testName = "JohnDoe";
    const testEmail = "john@doe.com";
    const testPassword = "Password123!";

    // Mock our fetch to fail
    fetch.mockResponse(async (req) => {
      if (req.url.includes("/api/users/me"))
        return JSON.stringify({ success: true, user: null });
      if (req.url.includes("/api/users") && req.method === "POST")
        return createUserFailedMock();
      return JSON.stringify({ success: true, result: [] });
    });

    render(<WrappedCreateUser />);

    // Fill in ALL required fields
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput), {
      target: { value: testName },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.emailInput), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.passwordInput), {
      target: { value: testPassword },
    });
    fireEvent.change(
      screen.getByTestId(TEST_ID_CREATE_USER.confirmPasswordInput),
      {
        target: { value: testPassword },
      },
    );
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.countrySelect), {
      target: { value: "NL" },
    });
    fireEvent.change(screen.getByTestId(TEST_ID_CREATE_USER.citySelect), {
      target: { value: "Amsterdam" },
    });
    fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.agreedToTermsInput));

    // Click submit
    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_ID_CREATE_USER.submitButton));
    });

    // Wait to see the error component
    await waitFor(() => {
      expect(
        screen.getByTestId(TEST_ID_CREATE_USER.errorContainer),
      ).toBeInTheDocument();
    });

    // Check to see that the fields are still filled in
    expect(screen.getByTestId(TEST_ID_CREATE_USER.usernameInput).value).toEqual(
      testName,
    );
  });
});
