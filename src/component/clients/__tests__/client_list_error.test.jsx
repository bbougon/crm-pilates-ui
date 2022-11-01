import React from "react";
import { afterAll, afterEach, beforeEach, describe, it } from "vitest";
import {
  APIErrorBody,
  RequestHandlerBuilders,
  ServerBuilder,
} from "../../../test-utils/server/server";
import { render } from "../../../test-utils/test-utils";
import { screen } from "@testing-library/react";
import Clients from "../ClientPage";

describe("faces an error", () => {
  const server = new ServerBuilder().serve(
    new RequestHandlerBuilders()
      .get("/clients")
      .unprocessableEntity()
      .body(new APIErrorBody().dummyDetail().build())
      .build()
  );

  beforeEach(() => server.listen());

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it("and should display it", async () => {
    render(<Clients />);

    expect(
      await screen.findByText("An error occurred (see message below):", {
        selector: "h5",
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("an error message", { selector: "p" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("an error type", { selector: "p" })
    ).toBeInTheDocument();
  });
});
