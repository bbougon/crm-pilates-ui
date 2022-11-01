import {
  RequestHandlerBuilders,
  ServerBuilder,
  SessionXLinkValueHeaderBuilder,
  XLinkHeaderBuilder,
} from "../../../test-utils/server/server";
import { afterAll, afterEach, beforeEach } from "vitest";
import {
  ApiAttendeeBuilder,
  ApiSessionsBuilder,
  ScheduleBuilder,
  SessionsBuilder,
} from "../../../test-utils/classroom/session";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../../../test-utils/test-utils";
import userEvent from "@testing-library/user-event";
import React from "react";
import { PilatesMonthlyCalendar } from "../PilatesMonthlyCalendar";

describe("Calendar", () => {
  describe("Navigate through calendar", () => {
    const server = new ServerBuilder().serve(
      new RequestHandlerBuilders().get("/clients").ok().body([]).build(),
      new RequestHandlerBuilders()
        .get("/sessions")
        .ok()
        .body([])
        .header(
          new XLinkHeaderBuilder().value(
            new SessionXLinkValueHeaderBuilder().current(
              new Date("2021-10-01T00:00:00")
            )
          )
        )
        .once()
        .build(),
      new RequestHandlerBuilders()
        .get("/sessions")
        .ok()
        .body(
          new SessionsBuilder()
            .withSession(
              new ApiSessionsBuilder()
                .withId("13")
                .withClassroom(1)
                .withName("Stage 1")
                .withSchedule(
                  new ScheduleBuilder("2021-11-01T11:20:00Z").build()
                )
                .withPosition(3)
                .build()
            )
            .withSession(
              new ApiSessionsBuilder()
                .withId("4")
                .withClassroom(1)
                .withName("Stage 2")
                .withSchedule(
                  new ScheduleBuilder("2021-11-01T13:20:00Z").build()
                )
                .withPosition(1)
                .withAttendee(
                  new ApiAttendeeBuilder()
                    .withId("3")
                    .withFirstname("Bertrand")
                    .withLastname("Bougon")
                    .checkedIn()
                    .build()
                )
                .build()
            )
            .build()
        )
        .header(
          new XLinkHeaderBuilder().value(
            new SessionXLinkValueHeaderBuilder().current(
              new Date("2021-11-10T00:00:00")
            )
          )
        )
        .build()
    );

    beforeEach(() => server.listen());

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    it("should display next month when clicking on 'next' month", async () => {
      render(<PilatesMonthlyCalendar date={new Date("2021-10-01T00:00:00")} />);

      userEvent.click(await screen.findByRole("button", { name: /next/i }));

      expect(
        await waitFor(() => screen.getByText("Stage 1"))
      ).toBeInTheDocument();
      await screen.findByText("Stage 2");
    });
  });
});
