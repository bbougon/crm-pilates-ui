import React from "react";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {render} from "../../../test-utils/test-utils";
import {SessionDetails} from "../SessionDetails";
import {attendee, AttendeesBuilder, schedule, session} from "../../../test-utils/classroom/session";
import {Attendance} from "../../../features/domain/session";
import {parseISO} from "date-fns";

describe.skip("SessionDetails", function() {

    it("should disable cancel action if attendee is checked in", async () => {
        let attendees = new AttendeesBuilder()
            .withAttendee(attendee(1, "Bruno", "Germain", Attendance.CHECKED_IN)).build();
        render(<SessionDetails session={session("1", "1", "Cours privé", "MAT",
            schedule(parseISO("2021-10-09T10:00:00"), parseISO("2021-10-09T11:00:00")), 1,
            attendees)} />)

        userEvent.click(screen.getByRole("button", {name: /more/i}))

        const options = screen.getByRole("presentation");
        expect(within(options).getByRole("menuitem", {name: /cancel/i})).toHaveAttribute("aria-disabled")
    })

    it("should display attendees credits", async () => {
        let attendees = new AttendeesBuilder()
            .withAttendee(attendee(1, "Bruno", "Germain", Attendance.CHECKED_IN, {amount: 5})).build();
        render(<SessionDetails session={session("1", "1", "Cours privé", "MAT",
            schedule(parseISO("2021-10-09T10:00:00"), parseISO("2021-10-09T11:00:00")), 1,
            attendees)} />)

        expect(screen.getByText("5", {selector: 'span'})).toBeInTheDocument()
    })
})