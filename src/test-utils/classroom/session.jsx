import {addHours, format, formatISO} from "date-fns";

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

export function SessionsBuilder() {
    this.sessions = []

    this.withSession = (session) => {
        this.sessions.push(session)
        return this
    }

    this.build = () => {
        return this.sessions
    }
}

export function SessionBuilder() {
    this.id = undefined
    this.classroom_id = 1
    this.name = "Cours tapis"
    this.schedule = {
        start: this.date,
        stop: addHours(this.date, 1)
    }
    this.position = 1
    this.attendees = []

    this.withId = (id) => {
        this.id = id
        return this
    }

    this.withClassroom = (classroomId) => {
        this.classroom_id = classroomId
        return this
    }

    this.withName = (name) => {
        this.name = name
        return this
    }

    this.withSchedule = (startDate, amount = 1) => {
        this.schedule.start = startDate
        this.schedule.stop = addHours(startDate, amount)
        return this
    }

    this.withScheduleAsString = (startDate) => {
        this.schedule.start = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSX")
        this.schedule.stop = format(addHours(startDate, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSX")
        return this
    }

    this.withPosition = (position) => {
        this.position = position
        return this
    }

    this.withAttendee = (attendee) => {
        this.attendees.push(attendee)
        return this
    }

    this.build = () => {
        return session(this.id, this.classroom_id, this.name, this.schedule, this.position, this.attendees)
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
                        schedule_ = schedule(), position = 1,
                        attendees = []) => {
    return {
        id: id,
        classroom_id: classroomId,
        name: name,
        schedule: schedule_,
        position: position,
        attendees: attendees
    }
}


