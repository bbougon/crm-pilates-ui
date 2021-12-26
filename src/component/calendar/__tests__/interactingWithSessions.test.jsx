import {APIErrorBody, ServerBuilder} from "../../../test-utils/server/server";
import {
    apiSession,
    ApiSessionsBuilder,
    attendee,
    schedule,
    SessionsBuilder
} from "../../../test-utils/classroom/session";
import {checkin, checkout} from "../../../test-utils/classroom/checkin";
import {actThenSleep, render} from "../../../test-utils/test-utils";
import Calendar from "../Calendar";
import userEvent from "@testing-library/user-event";
import {screen, waitForElementToBeRemoved, within} from "@testing-library/react";
import React from "react";
import {addHours, formatISO} from "date-fns";
import {Attendance} from "../../../features/sessionsSlice";

describe("Interacting with session", () => {

    const classroomDate = new Date("2021-11-01T10:00:00");
    const previousMonth = new Date("2021-10-01T00:00:00");
    const currentMonth = new Date("2021-11-01T00:00:00");
    const nextMonth = new Date("2021-12-01T00:00:00");

    const server = new ServerBuilder()
        .request("/sessions", "get", new SessionsBuilder()
            .withSession(
            new ApiSessionsBuilder().withClassroom(1).withName('Cours Duo')
                    .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.REGISTERED))
                    .build()
            )
            .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
        .request("/clients", "get", [])
        .request("/sessions/checkin", "post", checkin("15", 1, apiSession("15", 1, "Cours Duo", schedule(classroomDate, addHours(classroomDate, 1)), 2, [attendee(3, "Bertrand", "Bougon", Attendance.CHECKED_IN)])), 201)
        .build()

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it("should checkin attendee", async () => {
        await render(<Calendar date={classroomDate} />)

        userEvent.click(await screen.findByText("Cours Duo"))
        userEvent.click(await screen.findByRole("checkbox"))
        await actThenSleep(2)
        userEvent.click(await screen.findByText("Cours Duo"))

        expect(screen.getByText("C", {selector: "span"})).toBeInTheDocument()
    })

    describe("Facing an error", function () {

        const server = new ServerBuilder()
        .request("/sessions", "get", new SessionsBuilder()
            .withSession(
                new ApiSessionsBuilder().withClassroom(1).withName('Cours Duo')
                    .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                    .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.REGISTERED))
                    .build()
            )
            .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
        .request("/clients", "get", [])
        .request("/sessions/checkin", "post", new APIErrorBody()
            .dummyDetail()
            .build(), 422)
        .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it("should display the error", async () => {
            await render(<Calendar date={classroomDate} />)

            userEvent.click(await screen.findByText("Cours Duo"))
            userEvent.click(await screen.findByRole("checkbox"))

            expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
            expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
            expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
        })
    })

    describe("Proceeding to checkout", function () {
        const server = new ServerBuilder()
            .request("/sessions", "get", new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withId("15").withClassroom(1).withName('Cours Trio')
                        .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                        .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.CHECKED_IN))
                        .build()
                )
                .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .request("/clients", "get", [])
            .request("/sessions/15/checkout", "post", checkout("15", 1, apiSession("15", 1, "Cours Trio", schedule(classroomDate, addHours(classroomDate, 1)), 2, [attendee(3, "Bertrand", "Bougon", Attendance.REGISTERED)])), 200)
            .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it("should checkout attendee", async () => {
            await render(<Calendar date={classroomDate} />)

            userEvent.click(await screen.findByText("Cours Trio"))
            userEvent.click(await screen.findByRole("checkbox"))
            await actThenSleep(20)
            userEvent.click(await screen.findByText("Cours Trio"))

            expect(screen.getByText("R", {selector: "span"})).toBeInTheDocument()
        })

        describe("when facing an error", function () {
            const server = new ServerBuilder()
                .request("/sessions", "get", new SessionsBuilder()
                    .withSession(
                        new ApiSessionsBuilder().withId("15").withClassroom(1).withName('Cours Trio')
                            .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                            .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.CHECKED_IN))
                            .build()
                    )
                    .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
                .request("/clients", "get", [])
                .request("/sessions/15/checkout", "post", new APIErrorBody()
                    .dummyDetail()
                    .build(), 422)
                .build()

            beforeAll(() => server.listen())

            afterEach(() => server.resetHandlers())

            afterAll(() => server.close())

            it("should display the error", async () => {
                await render(<Calendar date={classroomDate} />)

                userEvent.click(await screen.findByText("Cours Trio"))
                userEvent.click(await screen.findByRole("checkbox"))

                expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
                expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
                expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
            })

        })
    })

    describe("Cancelling an attendee from session", function () {

        const server = new ServerBuilder()
            .request("/sessions", "get", new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withClassroom(1).withName('Cours Duo')
                        .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                        .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.REGISTERED))
                        .build()
                )
                .build(), 200, undefined, {"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .request("/clients", "get", [])
            .request("/sessions/cancellation/3", "post",
                checkin("15", 1, apiSession("15", 1, "Cours Duo", schedule(classroomDate, addHours(classroomDate, 1)), 2, [])),
                201)
            .build()

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it('should cancel the attendee', async () => {
            await render(<Calendar date={classroomDate} />)

            userEvent.click(await screen.findByText("Cours Duo"))
            userEvent.click(screen.getByRole("button", {name: /more/i}))
            const options = screen.getByRole("presentation");
            userEvent.click(within(options).getByRole("menuitem", {name: /cancel/i}))
            userEvent.click(await screen.findByText("Cours Duo"))

            expect(screen.queryByText('Bertrand Bougon')).not.toBeInTheDocument()
        });
    })
})