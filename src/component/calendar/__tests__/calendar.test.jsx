import {render} from "../../../test-utils/test-utils";
import {prettyDOM, screen} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";
import userEvent from "@testing-library/user-event";
import {format, subHours} from "date-fns";
import {ServerBuilder} from "../../../test-utils/server/server";
import {attendee, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";

describe('Calendar page', function () {
    const server = new ServerBuilder().request("/sessions", "get",
        new SessionsBuilder()
            .withSession(
                new SessionBuilder().withClassroom(1).withName('Pilates avancé')
                    .withSchedule(subHours(new Date(), 5)).withPosition(3)
                    .withAttendee(attendee(1, "Laurent", "Gas", "CHECKED_IN"))
                    .withAttendee(attendee(2, "Pierre", "Bernard", "REGISTERED"))
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(1).withClassroom(1).withName('Pilates machine')
                    .withSchedule(subHours(new Date(), 4)).withPosition(3)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", "REGISTERED"))
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(2).withClassroom(2).withName('Pilates tapis')
                    .withSchedule(subHours(new Date(), 3)).withPosition(4)
                    .build()
            )
            .withSession(
                new SessionBuilder().withClassroom(3).withName('Cours duo')
                    .withSchedule(subHours(new Date(), 2)).withPosition(2)
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(13).withClassroom(1).withName('Cours trio')
                    .withSchedule(subHours(new Date(), 1)).withPosition(3)
                    .build()
            )
            .withSession(
                new SessionBuilder().withId(4).withClassroom(1).withName('Cours privé')
                    .withSchedule(new Date()).withPosition(1)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", "CHECKED_IN"))
                    .build()
            )
            .build
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

    describe('Creating a classroom', () => {
        it('should open a classroom add form for October 6, 2021', () => {
            render(<Calendar date={new Date("2021-10-21T14:00:00")}/>)

            userEvent.click(screen.getAllByRole("button")[5])

            expect(screen.getByText("Add a classroom on ".concat(format(new Date("2021-10-04"), "yyyy-MM-dd"))))
        })
    })

})