import {ApiClassroom} from "../../api";
import {addHours, formatISO} from "date-fns";

export class ClassroomBuilder {

    private id = "1";
    private _name = "Cours tapis";
    private _position = 2;
    private _startDate: string = formatISO(new Date());
    private _endDate: string | null = formatISO(addHours(new Date(), 1));
    private subject: "MACHINE_DUO" | "MACHINE_TRIO" | "MACHINE_PRIVATE" | "MAT" = "MACHINE_DUO"
    private _duration = 60;
    private timeUnit: "MINUTE" = "MINUTE";
    private _attendees: { id: string }[] = [];

    build = (): ApiClassroom => {
        return {
            id: this.id,
            name: this._name,
            position: this._position,
            start_date: this._startDate,
            stop_date: this._endDate,
            subject: this.subject,
            duration: {
                duration: this._duration,
                unit: this.timeUnit
            },
            attendees: this._attendees
        }
    }

    startDate = (startDate: string):ClassroomBuilder => {
        this._startDate = startDate
        return this
    }

    endDate = (endDate: string): ClassroomBuilder => {
        this._endDate = endDate
        return this
    }

    attendees = (attendees: string[]): ClassroomBuilder => {
        this._attendees = attendees.map(attendee => ({id: attendee}))
        return this;
    }

    position = (position: number): ClassroomBuilder => {
        this._position = position
        return this
    }

    duration = (duration: number): ClassroomBuilder => {
        this._duration = duration
        return this
    }

    name = (name:string): ClassroomBuilder => {
        this._name = name
        return this
    }

    mat = (): ClassroomBuilder => {
        this.subject = "MAT"
        return this
    }
}