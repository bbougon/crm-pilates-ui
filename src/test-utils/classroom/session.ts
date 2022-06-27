import {addHours, formatISO, parseISO} from "date-fns";
import {ApiAttendee, ApiCredits, ApiSession} from "../../api";
import {Attendance, Attendee, Credits, Session} from "../../features/domain/session";
import {Subjects} from "../../features/domain/subjects";

export class AttendeesBuilder {

    private attendees: Attendee[] = []

    withAttendee = (attendee: Attendee) => {
        this.attendees.push(attendee)
        return this
    }

    build = () => {
        return this.attendees
    }
}

export class SessionsBuilder {
    sessions: (Session | ApiSession)[] = []

    withSession = (session: Session | ApiSession) => {
        this.sessions.push(session)
        return this
    }

    build = (): (Session | ApiSession)[] => {
        return this.sessions
    }
}

export class ApiSessionsBuilder {
    private id: string | undefined = undefined
    private classroomId = "1";
    private name = "Cours tapis";
    private schedule: { stop: string; start: string } = {
        start: formatISO(new Date()),
        stop: formatISO(addHours(new Date(), 1))
    };
    private subject = "MAT"
    private position = 1;
    private attendees?: [ApiAttendee];

    public withId = (id: string): ApiSessionsBuilder => {
        this.id = id
        return this
    }

    public withClassroom = (classroomId: string): ApiSessionsBuilder => {
        this.classroomId = classroomId
        return this
    }

    public withName = (name: string): ApiSessionsBuilder => {
        this.name = name
        return this
    }

    public withMachineTrio = (): ApiSessionsBuilder => {
        this.subject = "MACHINE_TRIO"
        return this
    }

    public withSchedule = (date: string, amount: number): ApiSessionsBuilder => {
        this.schedule.start = date
        this.schedule.stop = formatISO(addHours(parseISO(date), amount))
        return this
    }

    public withScheduleAsString = (date: string): ApiSessionsBuilder => {
        this.schedule.start = date
        this.schedule.stop = formatISO(addHours(parseISO(date), 1))
        return this
    }

    public withPosition = (position: number): ApiSessionsBuilder => {
        this.position = position
        return this
    }

    public withAttendee = (attendee: ApiAttendee): ApiSessionsBuilder => {
        this.attendees === undefined ? this.attendees = [attendee] : this.attendees?.push(attendee)
        return this
    }

    build = (): ApiSession => {
        return apiSession(this.id, this.classroomId, this.name, this.subject, this.schedule, this.position, this.attendees)
    }
}

export class SessionBuilder {
    private id: string | undefined = undefined;
    private classroomId = "1";
    private name = "Cours tapis";
    private schedule: { stop: string; start: string } = {
        start: formatISO(new Date()),
        stop: formatISO(addHours(new Date(), 1))
    };
    private position = 1;
    private subject: Subjects = Subjects.MAT
    private attendees: Attendee[] = [];

    withId = (id: string | undefined): SessionBuilder => {
        this.id = id
        return this
    }

    withClassroom = (classroomId: string): SessionBuilder => {
        this.classroomId = classroomId
        return this
    }

    withMachineTrio = (): SessionBuilder => {
        this.subject = Subjects.MACHINE_TRIO
        return this
    }

    withName = (name: string): SessionBuilder => {
        this.name = name
        return this
    }

    withSchedule = (startDate: string, amount = 1): SessionBuilder => {
        this.schedule.start = startDate
        this.schedule.stop = formatISO(addHours(parseISO(startDate), amount))
        return this
    }

    withScheduleAsString = (startDate: string): SessionBuilder => {
        this.schedule.start = startDate
        this.schedule.stop = formatISO(addHours(parseISO(startDate), 1))
        return this
    }

    withPosition = (position: number): SessionBuilder => {
        this.position = position
        return this
    }

    withAttendee = (attendee: Attendee): SessionBuilder => {
        this.attendees.push(attendee)
        return this
    }

    build = (): Session => {
        return session(this.id, this.classroomId, this.name, this.subject, this.schedule, this.position, this.attendees)
    }
}

export const attendee = (id = "1", firstname = "Laurent", lastname = "Gas", attendance: Attendance = Attendance.REGISTERED, credits: Credits | undefined = undefined): Attendee => {
    return {id: id, firstname: firstname, lastname: lastname, attendance: attendance, credits}
}

export const apiAttendee = (id = "1", firstname = "Laurent", lastname = "Gas", attendance: Attendance = Attendance.REGISTERED, credits: ApiCredits | undefined = undefined): ApiAttendee => {
    return {id: id, firstname: firstname, lastname: lastname, attendance: attendance, credits}
}

export const schedule = (start = new Date(), stop = addHours(new Date(), 1)) => {
    return {
        start: formatISO(start),
        stop: formatISO(stop)
    }
}

export const session = (id: string | undefined, classroomId = "1", name = "Pilates avancé",
                        subject = "MAT", schedule_ = schedule(), position = 1,
                        attendees: Attendee[] = []): Session => {
    return {
        id: id,
        classroomId: classroomId,
        subject: subject as Subjects,
        name: name,
        schedule: {...schedule_},
        position: position,
        attendees: attendees
    }
}

export const apiSession = (id: string | undefined, classroomId = "1", name = "Pilates avancé",
                           subject = "MAT", schedule_ = schedule(), position = 1,
                           attendees: [ApiAttendee] | undefined): ApiSession => {
    return {
        id: id,
        classroom_id: classroomId,
        name: name,
        subject: subject,
        schedule: {...schedule_},
        position: position,
        attendees: attendees
    }
}

