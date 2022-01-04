import {Subjects} from "../features/domain/subjects";

export const subjects = [{subject: Subjects.MAT, title: "Mat"}, {subject: Subjects.MACHINE_DUO, title: "Machine Duo"}, {
    subject: Subjects.MACHINE_TRIO, title: "Machine Trio"}, {subject: Subjects.MACHINE_PRIVATE, title: "Machine private"}]

export function translate(subject: Subjects): string | undefined {
    return subjects.find(subj => subj.subject === subject)?.title
}