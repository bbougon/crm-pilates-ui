export const classroom = (name = "Cours pilates", position = 1, startDate = new Date(), endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getHours() + 1), duration = 1, timeUnit = "HOUR", attendees = []) => {
    return {
        name: name,
        position: position,
        start_date: startDate,
        stop_date: endDate,
        duration: {
            duration: duration,
            unit: timeUnit
        },
        attendees: attendees
    }
}