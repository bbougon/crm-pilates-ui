import {ServerBuilder} from "../../../test-utils/server/server";
import {attendee, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";
import {screen, waitFor} from "@testing-library/react";
import {actThenSleep, render} from "../../../test-utils/test-utils";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import React from "react";

describe("Navigate through calendar", () => {
    const currentDate = new Date("2021-10-01T00:00:00")
    const previousMonth = new Date("2021-09-01T00:00:00")
    const currentMonth = new Date("2021-10-01T00:00:00")
    const nextMonth = new Date("2021-11-10T00:00:00")
    const lastMonth = new Date("2021-12-01T00:00:00")
    const server = new ServerBuilder()
        .request("/clients", "get", [])
        .request("/sessions", "get", [], 200, undefined, {"X-Link": `</sessions?month=${previousMonth.toISOString()}>; rel="previous", </sessions?month=${currentMonth.toISOString()}>; rel="current", </sessions?month=${nextMonth.toISOString()}>; rel="next"`})
        .request(`/sessions`, "get",
            new SessionsBuilder()
                .withSession(
                    new SessionBuilder().withId(13).withClassroom(1).withName('Stage 1')
                        .withSchedule(new Date("2021-11-01T11:20:00"), 1).withPosition(3)
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId(4).withClassroom(1).withName('Stage 2')
                        .withSchedule(new Date("2021-11-01T13:20:00"), 1).withPosition(1)
                        .withAttendee(attendee(3, "Bertrand", "Bougon", "CHECKED_IN"))
                        .build()
                )
                .build(),
            200, {month: nextMonth.toISOString()}, {"X-Link": `</sessions?month=${currentMonth.toISOString()}>; rel="previous", </sessions?month=${nextMonth.toISOString()}>; rel="current", </sessions?month=${lastMonth.toISOString()}>; rel="next"`}
        )
        .build()

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it("should display next month when clicking on 'next' month", async () => {
        await waitFor(() => render(<Calendar date={currentDate}/>))

        await actThenSleep(20)
        await waitFor(() => userEvent.click(screen.getByRole("button", {name: /next/i})))
        await actThenSleep(20)

        expect(await screen.findByText("Stage 1")).toBeInTheDocument()
        await waitFor(() => expect(screen.getByText("Stage 2")).toBeInTheDocument())
    })

})