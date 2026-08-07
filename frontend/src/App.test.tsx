import { describe, test, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("react-router-dom", () => ({
  NavLink: vi.fn(({ to, children, className }) => {
    const isActive = className ? className({ isActive: false }) : undefined;
    return (
      <a href={to} className={isActive}>
        {children}
      </a>
    );
  }),
  Outlet: vi.fn(() => <div data-testid="outlet" />),
  useLocation: vi.fn(() => ({pathname : '/'}))
}));

describe("App Component", () => {
  test("renders the header title and subtitle", () => {
    render(<App />);
    expect(screen.getByText("Baseball Player Statistics")).toBeInTheDocument();
    expect(screen.getByText("Explore player statistics")).toBeInTheDocument();
  });

  test("renders navigation links", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: "Players" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pitches" })).toBeInTheDocument();
  });

  test("renders the footer text", () => {
    render(<App />);
    expect(
      screen.getByText("Houston Astros - Baseball Statistics Dashboard")
    ).toBeInTheDocument();
  });

  test("renders the Outlet for child routes", () => {
    render(<App />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  test("renders navigation links with correct hrefs", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: "Players" })).toHaveAttribute("href", "players");
    expect(screen.getByRole("link", { name: "Pitches" })).toHaveAttribute("href", "pitches");
  });
});
