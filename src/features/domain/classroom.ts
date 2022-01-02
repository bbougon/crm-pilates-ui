import {Subjects} from "./subjects";

export interface Classroom {
    id?: string
    classroomName: string
    subject: Subjects.MAT | Subjects.MACHINE_DUO | Subjects.MACHINE_TRIO | Subjects.MACHINE_PRIVATE
    position: number
    startDate: string
    endDate: string | null
    duration: number
    attendees: Attendee[]
}

export interface Attendee {
    id: string
}
