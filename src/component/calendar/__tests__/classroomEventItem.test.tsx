import {render} from "../../../test-utils/test-utils";
import {screen} from "@testing-library/react";
import React from "react";
import {attendee, AttendeesBuilder, schedule, session} from "../../../test-utils/classroom/session";
import {addHours} from "date-fns";
import userEvent from "@testing-library/user-event";
import {ClassroomEventItem} from "../ClassroomEventItem";
import {formatFullDate, formatHours} from "../../../utils/date";
import {Attendance} from "../../../features/domain/session";

describe('Classroom Event', function () {

    it('should display classroom details when clicked', () => {
        const attendees = new AttendeesBuilder().withAttendee(attendee()).withAttendee(attendee("2", "Bertrand", "Bougon", Attendance.REGISTERED, {amount: 5})).build();
        const session_date = new Date();
        const classroomSession = session("1", "2", "Cours tapis", "MAT", schedule(session_date, addHours(session_date, 1)), 3, attendees);
        render(<ClassroomEventItem {...classroomSession}/>)

        userEvent.click(screen.getByText("Cours tapis"))

        expect(screen.getByRole("tooltip")).toBeInTheDocument()
        expect(screen.getByText("Cours tapis", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText(formatFullDate(classroomSession.schedule.start)
                .concat(` ${formatHours(classroomSession.schedule.start)}`)
                .concat(" to ")
                .concat(formatFullDate(classroomSession.schedule.stop))
                .concat(` ${formatHours(classroomSession.schedule.stop)}`)
            , {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText("Laurent Gas", {selector: 'p'})).toBeInTheDocument()
        expect(screen.getByText("0", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText("Bertrand Bougon", {selector: 'p'})).toBeInTheDocument()
        expect(screen.getByText("5", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getAllByText("R", {selector: 'span'})).toBeTruthy()
    })

    it('should display classroom details when clicked with expected attendee status', () => {
        const attendees = new AttendeesBuilder().withAttendee(attendee("1", "Bruno", "Germain")).withAttendee(attendee("2", "Bertrand", "Bougon", Attendance.CHECKED_IN)).build();
        const classroomSession = session(undefined, undefined, undefined, undefined, schedule(), undefined, attendees);
        render(<ClassroomEventItem {...classroomSession}/>)

        userEvent.click(screen.getByText(classroomSession.name))

        expect(screen.getByText("R", {selector: 'span'})).toBeInTheDocument()
        expect(screen.getByText("C", {selector: 'span'})).toBeInTheDocument()
    })
})