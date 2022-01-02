import {Subjects} from "./subjects";

export interface Session {
    id?: string | undefined
    classroomId: string
    name: string
    subject: Subjects
    schedule: {
        start: string
        stop: string
    }
    position: number
    attendees?: Attendee[]
}

export interface Attendee {
    id: string
    firstname: string
    lastname: string
    attendance: Attendance
    credits?: Credits
}

export enum Attendance {
    REGISTERED = "REGISTERED",
    CHECKED_IN = "CHECKED_IN",
}

export interface Credits {
    amount: number | undefined
}

export interface SessionsLink {
    current: { url: string }
    next: { url: string }
    previous: { url: string }
}