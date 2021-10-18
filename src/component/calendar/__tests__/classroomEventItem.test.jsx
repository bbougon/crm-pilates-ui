import {render} from "../../../test-utils/test-utils";
import {screen} from "@testing-library/react";
import React from "react";
import {ClassroomEventItem} from "../classroomEventItem";
import {attendee, AttendeesBuilder, schedule, session} from "../../../test-utils/classroom/session";
import {addHours, format} from "date-fns";
import userEvent from "@testing-library/user-event";

describe('Classroom Event', function () {

    it('should display classroom details when clicked', () => {
        let attendees = new AttendeesBuilder().withAttendee(attendee()).withAttendee(attendee(2, "Bertrand", "Bougon")).build();
        let session_date = new Date();
        let classroomSession = session(1, 2, "Cours tapis", session_date, schedule(session_date, addHours(session_date, 1)), 3, attendees);
        render(<ClassroomEventItem classroom={classroomSession}/>)

        userEvent.click(screen.getByText("Cours tapis"))

        expect(screen.getByRole("tooltip")).toBeInTheDocument()
        expect(screen.getByText("Cours tapis", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText(format(classroomSession.schedule.start, "yyyy-MM-dd H:mm").concat(" / ").concat(format(classroomSession.schedule.stop, "yyyy-MM-dd H:mm")), {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText("Laurent Gas", {selector: 'p'})).toBeInTheDocument()
        expect(screen.getByText("Bertrand Bougon", {selector: 'p'})).toBeInTheDocument()
        expect(screen.getAllByText("R", {selector: 'span'})).toBeTruthy()
    })

    it('should display classroom details when clicked with expected attendee status', () => {
        let attendees = new AttendeesBuilder().withAttendee(attendee(1, "Bruno", "Germain")).withAttendee(attendee(2, "Bertrand", "Bougon", "CHECKED_IN")).build();
        let classroomSession = session(undefined, undefined, undefined, undefined, undefined, undefined,attendees);
        render(<ClassroomEventItem classroom={classroomSession}/>)

        userEvent.click(screen.getByText(classroomSession.name))

        expect(screen.getByText("R", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText("C", {selector: 'span'})).toBeInTheDocument()
    })
})