import {Subjects} from "./subjects";

export type Schedule = {
    start: string;
    stop: string;
}

export interface Session {
    id?: string | undefined
    classroomId: string
    name: string
    subject: Subjects
    schedule: Schedule
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