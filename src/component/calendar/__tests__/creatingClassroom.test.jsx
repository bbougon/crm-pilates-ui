import {RequestHandlerBuilders, ServerBuilder} from "../../../test-utils/server/server";
import {addWeeks, format, formatISO} from "date-fns";
import {actThenSleep, render} from "../../../test-utils/test-utils";
import Calendar from "../Calendar";
import userEvent from "@testing-library/user-event";
import {fireEvent, screen, within} from "@testing-library/react";
import React from "react";
import {apiClient, ClientsBuilder} from "../../../test-utils/clients/clients";
import {attendee, SessionBuilder, SessionsBuilder} from "../../../test-utils/classroom/session";
import {Attendance} from "../../../features/domain/session";

describe('Creating a classroom', () => {

    const classroomDate = new Date("2021-10-01T15:15:00")
    const previousMonth = new Date("2021-09-01T00:00:00");
    const currentMonth = new Date("2021-10-01T00:00:00");
    const nextMonth = new Date("2021-11-01T00:00:00");

    let server = new ServerBuilder().serve(
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .once()
            .body([])
            .header({"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .build(),
        new RequestHandlerBuilders().get("/clients")
            .ok()
            .body(new ClientsBuilder()
                .withClient(apiClient())
                .withClient(apiClient("Bertrand", "Bougon", "2"))
                .withClient(apiClient("Pierre", "Martin", "3"))
                .withClient(apiClient("Jacques", "Martin", "4"))
                .build())
            .build(),
        new RequestHandlerBuilders().post("/classrooms")
            .created()
            .body({})
            .build(),
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body(new SessionsBuilder()
                .withSession(
                    new SessionBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(classroomDate), 2).withPosition(3)
                        .withAttendee(attendee("1", "Bougon", "Bertrand", Attendance.REGISTERED))
                        .withAttendee(attendee("2", "Pierre", "Martin", Attendance.REGISTERED))
                        .withAttendee(attendee("3", "Jacques", "Martin", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(addWeeks(classroomDate, 1)), 2).withPosition(3)
                        .withAttendee(attendee("1", "Bougon", "Bertrand", Attendance.REGISTERED))
                        .withAttendee(attendee("2", "Pierre", "Martin", Attendance.REGISTERED))
                        .withAttendee(attendee("3", "Jacques", "Martin", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(addWeeks(classroomDate, 2)), 2).withPosition(3)
                        .withAttendee(attendee("1", "Bougon", "Bertrand", Attendance.REGISTERED))
                        .withAttendee(attendee("2", "Pierre", "Martin", Attendance.REGISTERED))
                        .withAttendee(attendee("3", "Jacques", "Martin", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(addWeeks(classroomDate, 3)), 2).withPosition(3)
                        .withAttendee(attendee("1", "Bougon", "Bertrand", Attendance.REGISTERED))
                        .withAttendee(attendee("2", "Pierre", "Martin", Attendance.REGISTERED))
                        .withAttendee(attendee("3", "Jacques", "Martin", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(addWeeks(classroomDate, 4))).withPosition(3)
                        .withAttendee(attendee("1", "Bougon", "Bertrand", Attendance.REGISTERED))
                        .withAttendee(attendee("2", "Pierre", "Martin", Attendance.REGISTERED))
                        .withAttendee(attendee("3", "Jacques", "Martin", Attendance.REGISTERED))
                        .build()
                )
                .build()
            )
            .header({"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .build()
    );
    beforeAll(() => server.listen())

    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query) => ({
                media: query,
                matches: query === '(pointer: fine)',
                onchange: () => {
                },
                addListener: () => {
                },
                removeListener: () => {
                },
                dispatchEvent: () => false,
            }),
        });
    })

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it('should create a 2 hours classroom on October 1st, 2021 with 3 attendees', async () => {
        await render(<Calendar date={classroomDate}/>)

        await actThenSleep(20)
        const buttons = await screen.findAllByRole("button")
        userEvent.click(buttons[2])
        const classroomForm = await screen.findByRole("tooltip")

        expect(within(classroomForm).getByText("Add a classroom on ".concat(format(new Date("2021-10-01"), "yyyy-MM-dd")))).toBeInTheDocument()

        userEvent.type(within(classroomForm).getByText("Classroom's name"), "Cours Duo")

        fireEvent.mouseDown(within(classroomForm).getAllByRole("button", {name: /subject/i})[0])
        const subject = within(screen.getByRole('presentation'));
        userEvent.click(subject.getByText(/mat/i));
        expect(within(classroomForm).getByRole("button", {name: /mat/i})).toBeInTheDocument()

        fireEvent.mouseDown(within(classroomForm).getAllByRole("button", {name: /1/i})[0])
        const positions = screen.getByRole("presentation");
        userEvent.click(within(positions).getByText(/2/i));
        expect(within(classroomForm).getByRole("button", {name: /position 2/i})).toBeInTheDocument()

        fireEvent.mouseDown(within(classroomForm).getAllByRole("button", {name: /1h00/i})[0])
        const duration = screen.getByRole("presentation");
        userEvent.click(within(duration).getByText(/2h00/i));
        expect(within(classroomForm).getByRole("button", {name: /2h00/i})).toBeInTheDocument()

        userEvent.type(within(classroomForm).getByRole("textbox", {name: /attendees/i}), "Bertrand")
        const clients = await screen.findByRole("presentation");
        userEvent.click(within(clients).getByText(/bertrand/i))
        const attendees = within(classroomForm).getByRole("textbox", {name: /attendees/i});
        userEvent.type(attendees, "Pierre")
        userEvent.click(await screen.findByText(/pierre/i))
        userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Jacques")
        userEvent.click(screen.getByText(/jacques/i))


        const attendeesSelect = screen.getByRole("combobox");
        expect(within(attendeesSelect).getByText(/bougon bertrand/i)).toBeInTheDocument()
        expect(within(attendeesSelect).getByText(/martin pierre/i)).toBeInTheDocument()
        expect(within(attendeesSelect).getByText(/martin jacques/i)).toBeInTheDocument()
        expect(screen.getByRole("button", {name: /position 3/i})).toBeInTheDocument()

        let startDateInput = screen.getAllByRole("textbox")[1];
        userEvent.clear(startDateInput)
        userEvent.type(startDateInput, "10/01/2021 03:15 pm")
        let endDateInput = screen.getAllByRole("textbox")[2];
        userEvent.clear(endDateInput)
        userEvent.type(endDateInput, "10/01/2021 04:15 pm")
        expect(screen.getAllByRole("textbox")[1]).toHaveValue("10/01/2021 03:15 pm")
        expect(screen.getAllByRole("textbox")[2]).toHaveValue("10/01/2021 04:15 pm")

        userEvent.click(screen.getByRole("button", {name: /submit/i}))
    });
})