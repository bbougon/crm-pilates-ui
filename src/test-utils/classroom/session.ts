import { addHours, addWeeks, formatISO, parseISO } from "date-fns";
import { ApiAttendee, ApiCredits, ApiSession } from "../../api";
import {
  Attendance,
  Attendee,
  Credits,
  Schedule,
  Session,
} from "../../features/domain/session";
import { Subjects } from "../../features/domain/subjects";
import { faker } from "@faker-js/faker";

interface Builder<T> {
  build(): T;
}

export class AttendeesBuilder implements Builder<Attendee[]> {
  private attendees: Attendee[] = [];

  withAttendee = (attendee: Attendee): AttendeesBuilder => {
    this.attendees.push(attendee);
    return this;
  };

  build = (): Attendee[] => {
    return this.attendees;
  };
}

export class AttendeeBuilder implements Builder<Attendee> {
  private attendance: Attendance = Attendance.REGISTERED;
  private _id = "1";
  private _firstname: string = faker.name.firstName();
  private _lastname: string = faker.name.lastName();
  private _credits: Credits = {
    amount: faker.datatype.number({ min: 0, max: 10 }),
  };

  id = (id: string): AttendeeBuilder => {
    this._id = id;
    return this;
  };

  firstname = (firstname: string): AttendeeBuilder => {
    this._firstname = firstname;
    return this;
  };

  lastname = (lastname: string): AttendeeBuilder => {
    this._lastname = lastname;
    return this;
  };

  checkedIn = (): AttendeeBuilder => {
    this.attendance = Attendance.CHECKED_IN;
    return this;
  };

  credits = (amount: number): AttendeeBuilder => {
    this._credits = { amount };
    return this;
  };

  noCredits = (): AttendeeBuilder => {
    this._credits = { amount: undefined };
    return this;
  };

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
  sessions: (Session | ApiSession)[] = [];

  withSession = (session: Session | ApiSession) => {
    this.sessions.push(session);
    return this;
  };

  build = (): (Session | ApiSession)[] => {
    return this.sessions;
  };
}

export class SessionBuilder {
  private id: string | undefined = undefined;
  private classroomId = "1";
  private name = "Cours tapis";
  private schedule: Schedule = new ScheduleBuilder(new Date()).build();
  private position = 1;
  private subject: Subjects = Subjects.MAT;
  private attendees: Attendee[] = [];

  withId = (id: string | undefined): SessionBuilder => {
    this.id = id;
    return this;
  };

  withClassroom = (classroomId: string): SessionBuilder => {
    this.classroomId = classroomId;
    return this;
  };

  withMachineTrio = (): SessionBuilder => {
    this.subject = Subjects.MACHINE_TRIO;
    return this;
  };

  withName = (name: string): SessionBuilder => {
    this.name = name;
    return this;
  };

  withSchedule = (schedule: Schedule): SessionBuilder => {
    this.schedule = schedule;
    return this;
  };

  withScheduleAsString = (startDate: string): SessionBuilder => {
    this.schedule.start = startDate;
    this.schedule.stop = formatISO(addHours(parseISO(startDate), 1));
    return this;
  };

  withPosition = (position: number): SessionBuilder => {
    this.position = position;
    return this;
  };

  withAttendee = (attendee: Attendee): SessionBuilder => {
    this.attendees.push(attendee);
    return this;
  };

  withAttendees = (attendees: Attendee[]): SessionBuilder => {
    this.attendees.push(...attendees);
    return this;
  };

  build = (): Session => {
    return {
      id: this.id,
      classroomId: this.classroomId,
      subject: this.subject,
      name: this.name,
      schedule: this.schedule,
      position: this.position,
      attendees: this.attendees,
    };
  };
}

export class RecurrentSessionsBuilder {
  private session_template: ApiSessionBuilder | SessionBuilder =
    new ApiSessionBuilder();
  private duration: { period: "WEEKS"; for: number } = {
    period: "WEEKS",
    for: 3,
  };

  public withSession = (
    session: ApiSessionBuilder | SessionBuilder
  ): RecurrentSessionsBuilder => {
    this.session_template = session;
    return this;
  };

  public every = (duration: {
    period: "WEEKS";
    for: number;
  }): RecurrentSessionsBuilder => {
    this.duration = duration;
    return this;
  };

  public build = (): [ApiSession | Session] => {
    const apiSession = this.session_template.build();
    const session: [ApiSession | Session] = [apiSession];
    for (let i = 1; i <= this.duration.for; i++) {
      session.push(
        this.session_template
          .withSchedule(
            new ScheduleBuilder(
              addWeeks(parseISO(apiSession.schedule.start), i)
            ).build()
          )
          .build()
      );
    }
    return session;
  };
}

export class ApiSessionBuilder {
  private id: string | undefined = undefined;
  private classroomId = "1";
  private name = "Cours tapis";
  private schedule: Schedule = new ScheduleBuilder(new Date()).build();
  private subject = "MAT";
  private position = 1;
  private attendees?: [ApiAttendee];

  public withId = (id: string): ApiSessionBuilder => {
    this.id = id;
    return this;
  };

  public withClassroom = (classroomId: string): ApiSessionBuilder => {
    this.classroomId = classroomId;
    return this;
  };

  public withName = (name: string): ApiSessionBuilder => {
    this.name = name;
    return this;
  };
  public withSchedule = (schedule: Schedule): ApiSessionBuilder => {
    this.schedule = schedule;
    return this;
  };
  public withPosition = (position: number): ApiSessionBuilder => {
    this.position = position;
    return this;
  };

  public withAttendee = (attendee: ApiAttendee): ApiSessionBuilder => {
    this.attendees === undefined
      ? (this.attendees = [attendee])
      : this.attendees?.push(attendee);
    return this;
  };

  withAttendees = (attendees: [ApiAttendee] | undefined): ApiSessionBuilder => {
    this.attendees === undefined
      ? (this.attendees = attendees)
      : attendees !== undefined
      ? this.attendees.push(...attendees)
      : (this.attendees = undefined);
    return this;
  };

  build = (): ApiSession => {
    return {
      id: this.id,
      classroom_id: this.classroomId,
      name: this.name,
      subject: this.subject,
      schedule: this.schedule,
      position: this.position,
      attendees: this.attendees,
    };
  };
}

export class ApiAttendeeBuilder implements Builder<ApiAttendee> {
  private id: string = faker.datatype.string();
  private credits: ApiCredits | undefined = undefined;
  private attendance: "REGISTERED" | "CHECKED_IN" = "REGISTERED";
  private lastname: string = faker.name.lastName();
  private firstname: string = faker.name.firstName();

  build(): ApiAttendee {
    return {
      id: this.id,
      credits: this.credits,
      attendance: this.attendance,
      lastname: this.lastname,
      firstname: this.firstname,
    };
  }

  withId = (id: string): ApiAttendeeBuilder => {
    this.id = id;
    return this;
  };

  withFirstname = (firstname: string): ApiAttendeeBuilder => {
    this.firstname = firstname;
    return this;
  };

  withLastname = (lastname: string): ApiAttendeeBuilder => {
    this.lastname = lastname;
    return this;
  };
  checkedIn = (): ApiAttendeeBuilder => {
    this.attendance = "CHECKED_IN";
    return this;
  };

  with_credits = (credits: number): ApiAttendeeBuilder => {
    this.credits = { amount: credits };
    return this;
  };
}

export class ScheduleBuilder implements Builder<Schedule> {
  private readonly start: Date;
  private readonly stop: Date;

  constructor(start: Date | string) {
    this.start = typeof start === "string" ? parseISO(start) : start;
    this.stop = addHours(this.start, 1);
  }

  build(): Schedule {
    return {
      start: formatISO(this.start),
      stop: formatISO(this.stop),
    };
  }
}
