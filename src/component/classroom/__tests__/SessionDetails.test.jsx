import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {render} from "../../../test-utils/test-utils";
import {SessionDetails} from "../SessionDetails";
import {attendee, AttendeesBuilder, schedule, session} from "../../../test-utils/classroom/session";
import {Attendance} from "../../../features/sessionsSlice";

describe("SessionDetails", function() {

    it("should disable cancel action if attendee is checked in", async () => {
        let attendees = new AttendeesBuilder()
            .withAttendee(attendee(1, "Bruno", "Germain", Attendance.CHECKED_IN)).build();
        render(<SessionDetails {...session("1", "1", "Cours privé",
            schedule("2021-10-09T10:00:00", "2021-10-09T11:00:00"), 1,
            attendees)} />)

        userEvent.click(screen.getByRole("button", {name: /more/i}))

        const options = screen.getByRole("presentation");
        expect(within(options).getByRole("menuitem", {name: /cancel/i})).toHaveAttribute("aria-disabled")
    })
})