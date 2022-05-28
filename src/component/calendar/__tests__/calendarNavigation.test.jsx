import {RequestHandlerBuilders, ServerBuilder2} from "../../../test-utils/server/server";
import {ApiSessionsBuilder, attendee, SessionsBuilder} from "../../../test-utils/classroom/session";
import {screen, waitFor} from "@testing-library/react";
import {render} from "../../../test-utils/test-utils";
import Calendar from "../Calendar";
import userEvent from "@testing-library/user-event";
import React from "react";
import {Attendance} from "../../../features/domain/session";

describe("Navigate through calendar", () => {
    const currentDate = new Date("2021-10-01T00:00:00")
    const previousMonth = new Date("2021-09-01T00:00:00")
    const currentMonth = new Date("2021-10-01T00:00:00")
    const nextMonth = new Date("2021-11-10T00:00:00")
    const lastMonth = new Date("2021-12-01T00:00:00")
    let server = new ServerBuilder2().serve(
        new RequestHandlerBuilders().get("/clients")
            .ok()
            .body([])
            .build(),
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body([])
            .header({"X-Link": `</sessions?month=${previousMonth.toISOString()}>; rel="previous", </sessions?month=${currentMonth.toISOString()}>; rel="current", </sessions?month=${nextMonth.toISOString()}>; rel="next"`})
            .once()
            .build(),
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body(new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withId("13").withClassroom(1).withName('Stage 1')
                        .withSchedule("2021-11-01T11:20:00Z", 1).withPosition(3)
                        .build()
                )
                .withSession(
                    new ApiSessionsBuilder().withId("4").withClassroom(1).withName('Stage 2')
                        .withSchedule("2021-11-01T13:20:00Z", 1).withPosition(1)
                        .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.CHECKED_IN))
                        .build()
                )
                .build())
            .header({"X-Link": `</sessions?month=${currentMonth.toISOString()}>; rel="previous", </sessions?month=${nextMonth.toISOString()}>; rel="current", </sessions?month=${lastMonth.toISOString()}>; rel="next"`})
            .build()
    );

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it("should display next month when clicking on 'next' month", async () => {
        render(<Calendar date={currentDate}/>)

        userEvent.click(await waitFor(() => screen.getByRole("button", {name: /next/i})))

        await waitFor(() => expect(screen.getByText("Stage 1")).toBeInTheDocument())
        await waitFor(() => expect(screen.getByText("Stage 2")).toBeInTheDocument())
    })

})