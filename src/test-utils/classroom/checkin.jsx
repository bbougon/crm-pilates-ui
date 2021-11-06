export const checkin = (session_id, classroom_id, session) => {
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