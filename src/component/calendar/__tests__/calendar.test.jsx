import {render} from "../../../test-utils/test-utils";
import {prettyDOM, screen, waitFor} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import {format, subHours} from "date-fns";
import {ServerBuilder} from "../../../test-utils/server/server";
import {attendee, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";

describe('Calendar page', function () {
    let currentDate = new Date();
    let currentMonth = currentDate.toISOString()
    let previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()).toISOString()
    let nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()).toISOString()

    const server = new ServerBuilder().request("/sessions", "get",
        JSON.stringify(new SessionsBuilder()
            .withSession(
                new SessionBuilder().withClassroom(1).withName('Pilates avancé')
                    .withSchedule(subHours(currentDate, 5)).withPosition(3)
                    .withAttendee(attendee(1, "Laurent", "Gas", "CHECKED_IN"))
                    .withAttendee(attendee(2, "Pierre", "Bernard", "REGISTERED"))
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(1).withClassroom(1).withName('Pilates machine')
                    .withSchedule(subHours(currentDate, 4)).withPosition(3)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", "REGISTERED"))
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(2).withClassroom(2).withName('Pilates tapis')
                    .withSchedule(subHours(currentDate, 3)).withPosition(4)
                    .build()
            )
            .withSession(
                new SessionBuilder().withClassroom(3).withName('Cours duo')
                    .withSchedule(subHours(currentDate, 2)).withPosition(2)
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(13).withClassroom(1).withName('Cours trio')
                    .withSchedule(subHours(currentDate, 1)).withPosition(3)
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(4).withClassroom(1).withName('Cours privé')
                    .withSchedule(currentDate).withPosition(1)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", "CHECKED_IN"))
                    .build()
            )
            .build()),
        200,
        {Link: `<http://localhost/sessions?month=${previousMonth}>; rel="previous", <http://localhost/sessions?month=${currentMonth}>; rel="current", <http://localhost/sessions?month=${nextMonth}>; rel="next"`}
    )
        .build()

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it('should be displayed', () => {
        const {container} = render(<Calendar date={new Date("2021-09-08T12:00:00+01:00")}/>)

        expect(prettyDOM(container)).toMatchSnapshot()
    })

    it('should have a plus button on each day', () => {
        render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

        expect(screen.getAllByTestId("AddIcon")).toHaveLength(31)
    })

    describe("Navigate through calendar", () => {
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, currentDate.getDate()).toISOString()
        const server = new ServerBuilder()
            .request("/sessions", "get", [], 200, undefined, {Link: `<http://localhost/sessions?month=${previousMonth}>; rel="previous", <http://localhost/sessions?month=${currentMonth}>; rel="current", <http://localhost/sessions?month=${nextMonth}>; rel="next"`})
            .request(`/sessions`, "get",
                JSON.stringify(new SessionsBuilder()
                    .withSession(
                        new SessionBuilder().withId(13).withClassroom(1).withName('Stage 1')
                            .withSchedule(subHours(currentDate, 1)).withPosition(3)
                            .build()
                    )
                    .withSession(
                        new SessionBuilder().withId(4).withClassroom(1).withName('Stage 2')
                            .withSchedule(currentDate).withPosition(1)
                            .withAttendee(attendee(3, "Bertrand", "Bougon", "CHECKED_IN"))
                            .build()
                    )
                    .build()),
                200, {month: nextMonth}, {Link: `<http://localhost/sessions?month=${currentMonth}>; rel="previous", <http://localhost/sessions?month=${nextMonth}>; rel="current", <http://localhost/sessions?month=${lastMonth}>; rel="next"`}
            )
            .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it("should display next month when clicking on 'next' month", async () => {
            render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

            userEvent.click(screen.getByRole("button", {name: "Next"}))

            await waitFor(() => expect(screen.getByText("Cours trio")).toBeInTheDocument())
            await waitFor(() => expect(screen.getByText("Cours privé")).toBeInTheDocument())
        })

    })

    describe('Creating a classroom', () => {
        it('should open a classroom add form for October 6, 2021', () => {
            render(<Calendar date={new Date("2021-10-21T14:00:00")}/>)

            userEvent.click(screen.getAllByRole("button")[5])

            expect(screen.getByText("Add a classroom on ".concat(format(new Date("2021-10-04"), "yyyy-MM-dd")))).toBeInTheDocument()
        })
    })

})