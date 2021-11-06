import {ServerBuilder} from "../../../test-utils/server/server";
import {classroom} from "../../../test-utils/classroom/classroom";
import {SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";
import {addDays, format} from "date-fns";
import {render} from "../../../test-utils/test-utils";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import {fireEvent, screen, waitFor, within} from "@testing-library/react";
import React from "react";

describe('Creating a classroom', () => {

    const classroomDate = new Date("2021-10-06T10:00:00");
    const previousMonth = new Date("2021-09-01T00:00:00");
    const currentMonth = new Date("2021-10-01T00:00:00");
    const nextMonth = new Date("2021-11-01T00:00:00");

    const server = new ServerBuilder()
        .request("/classrooms", "post", classroom("Cours Duo", 2, classroomDate, new Date("2021-10-14T11:00:00"), 2, "HOUR", []), 201)
        .request("/clients", "get", [])
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
            .build(), 200, undefined, 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
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