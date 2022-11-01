import React from "react";
import { screen } from "@testing-library/react";
import { render } from "../test-utils/test-utils";
import App from "../App";
import { describe, it } from "vitest";

describe("App", () => {
  it("should display login page if not authenticated", () => {
    render(<App />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("side bar should not be displayed if not authenticated", () => {
    render(<App />);

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
