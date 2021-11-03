import {render} from "../../../test-utils/test-utils";
import {fireEvent, prettyDOM, screen, waitFor, within} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import {addDays, format, subHours} from "date-fns";
import {ServerBuilder} from "../../../test-utils/server/server";
import {attendee, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";
import {classroom} from "../../../test-utils/classroom/classroom";

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
        {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`}
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

        expect(screen.getAllByTestId("AddIcon")).toHaveLength(26)
    })

    describe("Navigate through calendar", () => {
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, currentDate.getDate()).toISOString()
        const server = new ServerBuilder()
            .request("/sessions", "get", [], 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .request(`/sessions`, "get",
                new SessionsBuilder()
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
                    .build(),
                200, {month: nextMonth}, {"X-Link": `</sessions?month=${currentMonth}>; rel="previous", </sessions?month=${nextMonth}>; rel="current", </sessions?month=${lastMonth}>; rel="next"`}
            )
            .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it.skip("should display next month when clicking on 'next' month", async () => {
            const {getByRole} = render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

            fireEvent.click(getByRole("button", {name: "Next"}))

            await waitFor(() => expect(screen.getByText("Cours trio")).toBeInTheDocument())
            await waitFor(() => expect(screen.getByText("Cours privé")).toBeInTheDocument())
        })

    })

    describe('Creating a classroom', () => {
        let classroomDate = new Date(2021, 10, 6, 10);
        const server = new ServerBuilder()
            .request("/classrooms", "post", classroom("Cours Duo", 2, classroomDate, new Date(2022, 6, 14, 11), 2, "HOUR", []), 201)
            .request("/sessions", "get", new SessionsBuilder()
                .withSession(
                    new SessionBuilder().withClassroom(1).withName('Cours Duo')
                        .withSchedule(classroomDate, 1).withPosition(2)
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom(1).withName('Cours Duo')
                        .withSchedule(addDays(classroomDate, 7)).withPosition(2)
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom(1).withName('Cours Duo')
                        .withSchedule(addDays(classroomDate, 14)).withPosition(2)
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom(1).withName('Cours Duo')
                        .withSchedule(addDays(classroomDate, 21)).withPosition(2)
                        .build()
                )
                .build())
            .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it('should open a classroom add form for October 6, 2021', () => {
            render(<Calendar date={new Date("2021-10-21T14:00:00")}/>)

            userEvent.click(screen.getAllByRole("button")[4])

            expect(screen.getByText("Add a classroom on ".concat(format(new Date("2021-10-04"), "yyyy-MM-dd")))).toBeInTheDocument()
        })

        it.skip('should add a classroom on October 6, 2021 and following weeks', async () => {
            render(<Calendar date={new Date("2021-10-01T14:00:00")}/>)

            userEvent.click(screen.getAllByRole("button")[7])
            userEvent.type(screen.getByText("Classroom's name"), "Cours Duo")
            fireEvent.mouseDown(screen.getByRole("button", {name: /position 1/i}))
            const position = within(screen.getByRole('listbox'));
            userEvent.click(position.getByText(/2/i));
            fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
            const duration = within(screen.getByRole('listbox'));
            userEvent.click(duration.getByText(/2h00/i));
            await waitFor(() => userEvent.type(screen.getByRole("textbox", {name: /Choose start date, selected date is Oct 6, 2021/i}), "10/06/2021 02:15 pm"))
            userEvent.click(screen.getByRole("button", {name: "OK"}))
            await waitFor(() => userEvent.type(screen.getByRole("textbox", {name: /Choose end date, selected date is Oct 6, 2021/i}), "10/06/2021 03:15 pm"))
            userEvent.click(screen.getByRole("button", {name: /submit/i}))

            await waitFor(() => expect(screen.findAllByText("Cours Duo")).toHaveLength(4))
        })
    })

})