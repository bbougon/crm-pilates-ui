import {afterEach, beforeEach, describe, it} from "vitest";
import {
    RequestHandlerBuilders,
    ServerBuilder,
    SessionXLinkValueHeaderBuilder,
    XLinkHeaderBuilder
} from "../test-utils/server/server";
import {ApiAttendeeBuilder, ApiSessionsBuilder, attendee, SessionsBuilder} from "../test-utils/classroom/session";
import {formatISO} from "date-fns";
import {Attendance} from "../features/domain/session";
import {render} from "../test-utils/test-utils";
import App from "../App";
import userEvent from "@testing-library/user-event";
import {screen, waitFor} from "@testing-library/react";
import React from "react";

describe.skip("Calendar page", () => {

    const classroomDate = new Date("2021-11-01T10:00:00");
    let sessionHeaderBuilder = new XLinkHeaderBuilder().value(new SessionXLinkValueHeaderBuilder().current(new Date("2021-11-01T00:00:00")))
    const server = new ServerBuilder().serve(
        new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body(new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withClassroom("1").withName('Cours Duo')
                        .withSchedule(classroomDate).withPosition(2)
                        .withAttendee(
                            new ApiAttendeeBuilder()
                                .withId("3")
                                .withFirstname("Bertrand")
                                .withLastname("Bougon")
                                .build()
                        )
                        .build()
                )
                .build())
            .header(sessionHeaderBuilder)
            .build(),
        new RequestHandlerBuilders().get("/clients")
            .ok()
            .body([])
            .build(),
    )

    beforeAll(() => server.listen())

    afterAll(() => server.close())

    beforeEach(() => sessionStorage.setItem("token", JSON.stringify({token: "my-token", type: "bearer"})))

    afterEach(() => {
        server.resetHandlers()
        sessionStorage.removeItem("token")
    })

    it('should be displayed', async () => {
        render(<App/>)

        userEvent.click(screen.getAllByRole("link")[4])

        expect(await waitFor(() => screen.findByText(/monday/i))).toBeInTheDocument()
        expect(await waitFor(() => screen.findByText(/tuesday/i))).toBeInTheDocument()
        expect(await waitFor(() => screen.findByText(/wednesday/i))).toBeInTheDocument()
        expect(await waitFor(() => screen.findByText(/thursday/i))).toBeInTheDocument()
        expect(await waitFor(() => screen.findByText(/friday/i))).toBeInTheDocument()
        expect(await waitFor(() => screen.findByText(/saturday/i))).toBeInTheDocument()
    })

})