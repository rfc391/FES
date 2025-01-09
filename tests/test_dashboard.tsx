
import { render, screen } from "@testing-library/react";
import Dashboard from "@/pages/Dashboard";
import { useThreats } from "@/hooks/use-threats";
import { useUser } from "@/hooks/use-user";

jest.mock("@/hooks/use-threats");
jest.mock("@/hooks/use-user");

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard with active threats", () => {
    useThreats.mockReturnValue({ threats: [{ type: "Test Threat", severity: "high", location: "Location", timestamp: "2025-01-01" }] });
    useUser.mockReturnValue({ user: { username: "testuser" }, logout: jest.fn() });

    render(<Dashboard />);

    expect(screen.getByText("Global Threat Map")).toBeInTheDocument();
    expect(screen.getByText("Active Threats")).toBeInTheDocument();
    expect(screen.getByText("Test Threat")).toBeInTheDocument();
  });
});
