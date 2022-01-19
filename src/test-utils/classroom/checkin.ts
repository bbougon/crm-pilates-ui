import {ApiSession} from "../../api";
import {formatISO} from "date-fns";

export const checkinResponse = (session_id: string, classroom_id: string, session: ApiSession) => {
    return {
        id: session_id,
        name: session.name,
        classroom_id: classroom_id,
        position: session.position,
        schedule: {
            start: session.schedule.start,
            stop: session.schedule.stop
        },
        attendees: session.attendees
    }
}

export const checkinRequest = (start: Date, classroomId: string, attendeeId: string) => {
    return {
        session_date: formatISO(start),
        classroom_id: classroomId,
        attendee: attendeeId
    }
}

export const checkout = (session_id: string, classroom_id: string, session: ApiSession) => {
    return checkinResponse(session_id, classroom_id, session)
}

export const checkoutRequest = (attendeeId: string) => {
    return {
        attendee: attendeeId
    }
}

export const cancellationRequest = (classroomId: string, sessionDate: Date) => {
    return {
        classroom_id: classroomId,
        session_date: formatISO(sessionDate)
    }
}