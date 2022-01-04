import {Subjects} from "./subjects";

export interface Credits {
    value: number
    subject: Subjects
}

export interface Client {
    firstname: string
    lastname: string
    id: string
    credits?: Credits[]
}