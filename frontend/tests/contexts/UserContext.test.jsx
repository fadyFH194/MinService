import React from "react";
import { render } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/contexts/AuthProvider";

// Mock GoogleOAuthProvider
jest.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  useGoogleLogin: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock("../../src/contexts/ApiProvider", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>, // Mock implementation of ApiProvider
  useApi: jest.fn().mockReturnValue({
    post: jest.fn().mockResolvedValue({ body: { user: null } }),
  }),
}));

describe("UserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children", () => {
    const { getByText } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    expect(getByText("Test")).toBeInTheDocument();
  });

  it("should provide user context", () => {
    const TestComponent = () => {
      const { user } = useAuth();
      expect(user).toBeNull(); // Ensure the initial user state is null
      return <div>Test Component</div>;
    };

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText("Test Component")).toBeInTheDocument();
  });
});
