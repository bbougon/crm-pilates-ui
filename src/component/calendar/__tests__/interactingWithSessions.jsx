import {ServerBuilder} from "../../../test-utils/server/server";
import {attendee, schedule, session, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";
import {checkin} from "../../../test-utils/classroom/checkin";
import {actThenSleep, render} from "../../../test-utils/test-utils";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import {screen, waitFor} from "@testing-library/react";
import React from "react";
import {addHours} from "date-fns";

describe("Interacting with session", () => {

    const classroomDate = new Date("2021-11-01T10:00:00");
    const previousMonth = new Date("2021-10-01T00:00:00");
    const currentMonth = new Date("2021-11-01T00:00:00");
    const nextMonth = new Date("2021-12-01T00:00:00");

    const server = new ServerBuilder()
        .request("/sessions", "get", new SessionsBuilder()
            .withSession(
                new SessionBuilder().withClassroom(1).withName('Cours Duo')
                    .withSchedule(classroomDate, 1, 1).withPosition(2)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", "REGISTERED"))
                    .build()
            )
            .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
        .request("/clients", "get", [])
        .request("/sessions/checkin", "post", checkin(15, 1, session(undefined, 1, "Cours Duo", schedule(classroomDate, addHours(classroomDate, 1)), 2, attendee(3, "Bertrand", "Bougon", "CHECKEDIN"))), 201)
        .build()

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it.skip("should checkin attendee", async () => {
        await render(<Calendar date={classroomDate} />)

        await actThenSleep(20)
        userEvent.click(await screen.findByText("Cours Duo"))
        userEvent.click(await screen.findByRole("checkbox"))
        await actThenSleep(20)
        userEvent.click(await screen.findByText("Cours Duo"))

        await waitFor(() => expect(screen.getByText("C", {selector: "span"})).toBeInTheDocument())
    })
})