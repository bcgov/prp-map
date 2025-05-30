import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TestComponent from "./Test";

describe("TestComponent", () => {
  it("renders the heading and paragraph", () => {
    render(<TestComponent />);

    expect(
      screen.getByRole("heading", { name: /test component/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this is a simple test component\./i),
    ).toBeInTheDocument();
  });
});
