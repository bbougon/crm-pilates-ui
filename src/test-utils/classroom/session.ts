import {addHours, formatISO, parseISO} from "date-fns";
import {Attendance, Attendee, Session} from "../../features/sessionsSlice";
import {ApiAttendee, ApiSession} from "../../api";

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
    sessions: any[] = []

    withSession = (session: Session | ApiSession) => {
        this.sessions.push(session)
        return this
    }

    build = (): Session[] | ApiSession[] => {
        return this.sessions
    }
}

export class ApiSessionsBuilder {
    private id: string | undefined = undefined
    private classroomId: string = "1";
    private name: string = "Cours tapis";
    private schedule: { stop: string; start: string } = {
        start: formatISO(new Date()),
        stop: formatISO(addHours(new Date(), 1))
    };
    private position: number = 1;
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
        return {
            id: this.id,
            classroom_id: this.classroomId,
            name: this.name,
            schedule: this.schedule,
            position: this.position,
            attendees: this.attendees
        }
    }
}

export class SessionBuilder {
    private id: string | undefined = undefined;
    private classroomId: string = "1";
    private name: string = "Cours tapis";
    private schedule: { stop: string; start: string } = {
        start: formatISO(new Date()),
        stop: formatISO(addHours(new Date(), 1))
    };
    private position: number = 1;
    private attendees: Attendee[] = [];

    withId = (id: string | undefined) => {
        this.id = id
        return this
    }

    withClassroom = (classroomId: string) => {
        this.classroomId = classroomId
        return this
    }

    withName = (name: string) => {
        this.name = name
        return this
    }

    withSchedule = (startDate: string, amount = 1) => {
        this.schedule.start = startDate
        this.schedule.stop = formatISO(addHours(parseISO(startDate), amount))
        return this
    }

    withScheduleAsString = (startDate: string) => {
        this.schedule.start = startDate
        this.schedule.stop = formatISO(addHours(parseISO(startDate), 1))
        return this
    }

    withPosition = (position: number) => {
        this.position = position
        return this
    }

    withAttendee = (attendee: Attendee) => {
        this.attendees.push(attendee)
        return this
    }

    build = () => {
        return session(this.id, this.classroomId, this.name, this.schedule, this.position, this.attendees)
    }
}

export const attendee = (id: string = "1", firstname: string = "Laurent", lastname: string = "Gas", attendance: Attendance = Attendance.REGISTERED): Attendee => {
    return {id: id, firstname: firstname, lastname: lastname, attendance: attendance}
}

export const schedule = (start = formatISO(new Date()), stop = formatISO(addHours(new Date(), 1))) => {
    return {
        start: start,
        stop: stop
    }
}

export const session = (id: string | undefined, classroomId: string = "1", name: string = "Pilates avancé",
                        schedule_ = schedule(), position: number = 1,
                        attendees: Attendee[] = []): Session => {
    return {
        id: id,
        classroomId: classroomId,
        name: name,
        schedule: {...schedule_},
        position: position,
        attendees: attendees
    }
}

export const apiSession = (id: string | undefined, classroomId: string = "1", name: string = "Pilates avancé",
                           schedule_ = schedule(), position: number = 1,
                           attendees: [{ id: string, firstname: string, lastname: string, attendance: string }]): ApiSession => {
    return {
        id: id,
        classroom_id: classroomId,
        name: name,
        schedule: {...schedule_},
        position: position,
        attendees: attendees
    }
}

