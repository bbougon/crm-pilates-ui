import {addHours, formatISO, parseISO} from "date-fns";
import {ApiAttendee, ApiCredits, ApiSession} from "../../api";
import {Attendance, Attendee, Credits, Schedule, Session} from "../../features/domain/session";
import {Subjects} from "../../features/domain/subjects";
import {faker} from "@faker-js/faker";

interface Builder<T> {
    build(): T
}
export class AttendeesBuilder implements Builder<Attendee[]>{

    private attendees: Attendee[] = []

    withAttendee = (attendee: Attendee): AttendeesBuilder => {
        this.attendees.push(attendee)
        return this
    }

    build = (): Attendee[] => {
        return this.attendees
    }
}

export class AttendeeBuilder implements Builder<Attendee> {

    private attendance: Attendance = Attendance.REGISTERED;
    private _id = "1";
    private _firstname: string = faker.name.firstName();
    private _lastname: string = faker.name.lastName();
    private _credits: Credits = {amount: faker.datatype.number({min: 0, max: 10})};

    id = (id: string): AttendeeBuilder => {
        this._id = id;
        return this;
    }

    firstname = (firstname: string): AttendeeBuilder => {
        this._firstname = firstname
        return this;
    }

    lastname = (lastname: string): AttendeeBuilder => {
        this._lastname = lastname
        return this;
    }

    checkedIn = (): AttendeeBuilder => {
        this.attendance = Attendance.CHECKED_IN
        return this;
    }

    credits = (amount: number): AttendeeBuilder => {
        this._credits = {amount}
        return this;
    }

    noCredits = (): AttendeeBuilder => {
        this._credits = {amount: undefined};
        return this;
    }

    build(): Attendee {
        return {
            id: this._id,
            firstname: this._firstname,
            lastname: this._lastname,
            attendance: this.attendance,
            credits: this._credits,
        };
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


export class ApiAttendeeBuilder implements Builder<ApiAttendee>{
    private id: string = faker.datatype.string();
    private credits: ApiCredits | undefined = undefined;
    private attendance: 'REGISTERED' | 'CHECKED_IN' = 'REGISTERED';
    private lastname: string = faker.name.lastName();
    private firstname: string = faker.name.firstName();

    build(): ApiAttendee {
        return {
            id: this.id,
            credits: this.credits,
            attendance: this.attendance,
            lastname: this.lastname,
            firstname: this.firstname
        };
    }

    withId = (id: string): ApiAttendeeBuilder => {
        this.id = id
        return this
    }

    withFirstname = (firstname: string): ApiAttendeeBuilder => {
        this.firstname = firstname
        return this
    }

    withLastname = (lastname: string): ApiAttendeeBuilder => {
        this.lastname = lastname
        return this
    }

    noCredits = (): ApiAttendeeBuilder => {
        this.credits = undefined
        return this
    }

    checkedIn = (): ApiAttendeeBuilder => {
        this.attendance = 'CHECKED_IN'
        return this
    }

    with_credits = (credits: number): ApiAttendeeBuilder => {
        this.credits = {amount: credits}
        return this
    }
}

export class ScheduleBuilder implements Builder<Schedule>{
    private readonly start: Date;
    private readonly stop: Date;

    constructor(start: Date | string) {
        this.start = typeof start === 'string' ? parseISO(start) : start;
        this.stop = addHours(this.start, 1)
    }

    build(): Schedule {
        return {
            start: formatISO(this.start),
            stop: formatISO(this.stop)
        }
    }

}

export const session = (id: string | undefined, classroomId = "1", name = "Pilates avancé",
                        subject = "MAT", schedule_ = new ScheduleBuilder(new Date())
        .build(), position = 1,
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
                           subject = "MAT", schedule_ = new ScheduleBuilder(new Date())
        .build(), position = 1,
                           attendees: [ApiAttendee] | undefined = undefined): ApiSession => {
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

