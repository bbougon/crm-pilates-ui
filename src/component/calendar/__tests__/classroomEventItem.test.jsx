import {render} from "../../../test-utils/test-utils";
import {screen} from "@testing-library/react";
import React from "react";
import {ClassroomEventItem} from "../classroomEventItem";
import {attendee, AttendeesBuilder, schedule, session} from "../../../test-utils/classroom/session";
import {addHours, format} from "date-fns";
import userEvent from "@testing-library/user-event";

describe('Classroom Event', function () {

    it('should display classroom details when clicked', () => {
        let attendees = new AttendeesBuilder().withAttendee(attendee(), attendee(2, "Bertrand", "Bougon")).build();
        let session_date = new Date();
        let classroomSession = session(1, 2, "Cours tapis", session_date, schedule(session_date, addHours(session_date, 1)), 3, attendees);
        const {container} = render(<ClassroomEventItem classroom={classroomSession}/>)

        userEvent.click(screen.getByText("Cours tapis"))

        expect(screen.findByText("Cours tapis", {selector: 'h5'})).toBeInTheDocument()
        expect(screen.findByText("Heure de début", {selector: 'h6'})).toHaveValue(format(session.schedule.start, "yyyy-MM-dd H:mm"))
    })
})