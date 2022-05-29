import {
    APIErrorBody,
    RequestHandlerBuilders,
    ServerBuilder,
    SessionXLinkValueHeaderBuilder,
    XLinkHeaderBuilder
} from "../../../test-utils/server/server";
import {
    apiSession,
    ApiSessionsBuilder,
    attendee,
    schedule,
    SessionsBuilder
} from "../../../test-utils/classroom/session";
import {
    cancellationRequest,
    checkinRequest,
    checkinResponse,
    checkout,
    checkoutRequest
} from "../../../test-utils/classroom/checkin";
import {actThenSleep, render} from "../../../test-utils/test-utils";
import Calendar from "../Calendar";
import userEvent from "@testing-library/user-event";
import {screen, waitFor, within} from "@testing-library/react";
import React from "react";
import {addHours, formatISO} from "date-fns";
import {Attendance} from "../../../features/domain/session";

describe("Interacting with session", () => {

    const classroomDate = new Date("2021-11-01T10:00:00");
    let sessionHeaderBuilder = new XLinkHeaderBuilder().value(new SessionXLinkValueHeaderBuilder().current(new Date("2021-11-01T00:00:00")))
    const server = new ServerBuilder().serve(
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body(new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                        .withAttendee(attendee("3", "Bertrand", "Bougon", Attendance.REGISTERED))
                        .build()
                )
                .build())
            .header(sessionHeaderBuilder)
            .build(),
        new RequestHandlerBuilders().get("/clients")
            .ok()
            .body([])
            .build(),
        new RequestHandlerBuilders().post("/sessions/checkin")
            .created()
            .request(checkinRequest(classroomDate, "1", "3"))
            .body(checkinResponse("15", "1", apiSession("15", "1", "Cours Duo", "MAT", schedule(classroomDate, addHours(classroomDate, 1)), 2, [attendee("3", "Bertrand", "Bougon", Attendance.CHECKED_IN)])))
            .build()
    )

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it("should checkin attendee", async () => {
        await render(<Calendar date={classroomDate} />)

        userEvent.click(await screen.findByText("Cours Duo"))
        userEvent.click(await screen.findByRole("checkbox"))
        await actThenSleep(20)
        userEvent.click(await screen.findByText("Cours Duo"))

        await waitFor(() => expect(screen.getByText("C", {selector: "span"})).toBeInTheDocument())
    })

    describe("Facing an error", function () {

        it("should display the error", async () => {
            server.resetHandlers(
                new RequestHandlerBuilders().get("/sessions")
                    .ok()
                    .body(new SessionsBuilder()
                        .withSession(
                            new ApiSessionsBuilder().withClassroom(1).withName('Cours Duo')
                                .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                                .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.REGISTERED))
                                .build()
                        )
                        .build())
                    .header(sessionHeaderBuilder)
                    .build(),
                new RequestHandlerBuilders().get("/clients")
                    .ok()
                    .body([])
                    .build(),
                new RequestHandlerBuilders().post("/sessions/checkin")
                    .unprocessableEntity()
                    .body(new APIErrorBody()
                        .dummyDetail()
                        .build())
                    .build()
            )

            await render(<Calendar date={classroomDate} />)

            userEvent.click(await screen.findByText("Cours Duo"))
            userEvent.click(await screen.findByRole("checkbox"))

            expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
            expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
            expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
        })
    })

    describe("Proceeding to checkout", function () {

        it("should checkout attendee", async () => {

            server.resetHandlers(
                new RequestHandlerBuilders().get("/sessions")
                    .ok()
                    .body(new SessionsBuilder()
                        .withSession(
                            new ApiSessionsBuilder().withId("15").withClassroom("1").withName('Cours Trio')
                                .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                                .withAttendee(attendee("3", "Bertrand", "Bougon", Attendance.CHECKED_IN))
                                .build()
                        )
                        .build())
                    .header(sessionHeaderBuilder)
                    .build(),
                new RequestHandlerBuilders().get("/clients").ok().body([]).build(),
                new RequestHandlerBuilders().post("/sessions/15/checkout")
                    .ok()
                    .request(checkoutRequest("3"))
                    .body(checkout("15", "1", apiSession("15", "1", "Cours Trio", undefined, schedule(classroomDate, addHours(classroomDate, 1)), 2, [attendee("3", "Bertrand", "Bougon", Attendance.REGISTERED)])))
                    .build()
            )
            await render(<Calendar date={classroomDate} />)

            userEvent.click(await screen.findByText("Cours Trio"))
            userEvent.click(await screen.findByRole("checkbox"))
            await actThenSleep(20)
            userEvent.click(await screen.findByText("Cours Trio"))

            expect(screen.getByText("R", {selector: "span"})).toBeInTheDocument()
        })

        describe("when facing an error", function () {

            it("should display the error", async () => {
                server.resetHandlers(new RequestHandlerBuilders().get("/sessions")
                    .ok()
                    .body(new SessionsBuilder()
                        .withSession(
                            new ApiSessionsBuilder().withId("15").withClassroom(1).withName('Cours Trio')
                                .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                                .withAttendee(attendee(3, "Bertrand", "Bougon", Attendance.CHECKED_IN))
                                .build()
                        ).build())
                    .header(sessionHeaderBuilder)
                    .build(),
                    new RequestHandlerBuilders().get("/clients")
                        .ok()
                        .body([])
                        .build(),
                    new RequestHandlerBuilders().post("/sessions/15/checkout")
                        .unprocessableEntity()
                        .body(new APIErrorBody()
                            .dummyDetail()
                            .build())
                        .build()
                )
                await render(<Calendar date={classroomDate} />)

                userEvent.click(await screen.findByText("Cours Trio"))
                userEvent.click(await screen.findByRole("checkbox"))

                expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
                expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
                expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
            })

        })
    })

    describe("Cancelling an attendee of a session", function () {

        it('should cancel the attendee', async () => {
            server.resetHandlers(
                new RequestHandlerBuilders().get("/sessions")
                    .ok()
                    .body(new SessionsBuilder()
                        .withSession(
                            new ApiSessionsBuilder().withClassroom("1").withName('Cours Duo')
                                .withSchedule(formatISO(classroomDate), 1).withPosition(2)
                                .withAttendee(attendee("3", "Bertrand", "Bougon", Attendance.REGISTERED))
                                .build()
                        )
                        .build())
                    .header(sessionHeaderBuilder)
                    .build(),
                new RequestHandlerBuilders().get("/clients")
                    .ok()
                    .body([])
                    .build(),
                new RequestHandlerBuilders().post("/sessions/cancellation/3")
                    .created()
                    .request(cancellationRequest("1", classroomDate))
                    .body(checkinResponse("15", "1", apiSession("15", "1", "Cours Duo", undefined, schedule(classroomDate, addHours(classroomDate, 1)), 2, [])))
                    .build()
            )
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