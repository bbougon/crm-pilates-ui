import {addHours} from "date-fns";

export function AttendeesBuilder() {
    this.attendees = []

    this.withAttendee = (attendee) => {
        this.attendees.push(attendee)
        return this
    }

    this.build = () => {
        return this.attendees
    }
}

export const attendee = (id = 1, firstname = "Laurent", lastname = "Gas", attendance = "REGISTERED") => {
    return {id: id, firstname: firstname, lastname: lastname, attendance: attendance}
}

export const schedule = (start= new Date(), stop = addHours(new Date(), 1)) => {
    return {
        start: start,
        stop: stop
    }
}

export const session = (id = undefined, classroomId = 1, name = "Pilates avancé",
                        date = new Date(), schedule_ = schedule(), position = 1,
                        attendees = []) => {
    return {
        id: id,
        classroomId: classroomId,
        name: name,
        date: date,
        schedule: schedule_,
        position: position,
        attendees: attendees
    }
}


