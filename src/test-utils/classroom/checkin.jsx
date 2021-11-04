export const checkin = (classroom_id, session_date, attendee) => {
    return {
        classroom_id: classroom_id,
        session_date: session_date,
        attendee: attendee
    }
}