import {Subjects} from "../../features/domain/subjects";
import {Attendee} from "../../features/domain/classroom";
import {Client} from "../../features/domain/client";
import {addMinutes, formatISO, intervalToDuration, parseISO, roundToNearestMinutes} from "date-fns";
import set from "date-fns/set";

export enum ActionType {
    CLASSROOM_NAME_CHANGED = "CLASSROOM_NAME_CHANGED",
    SUBJECT_CHANGED = "SUBJECT_CHANGED",
    POSITION_CHANGED = "POSITION_CHANGED",
    DURATION_UPDATED = "DURATION_UPDATED",
    ATTENDEES_UPDATED = "ATTENDEES_UPDATED",
    START_DATE_UPDATED = "START_DATE_UPDATED",
    END_DATE_UPDATED = "END_DATE_UPDATED",
}

export type SchedulingState = {
    classroomName: string
    position: number
    subject?: Subjects | unknown
    duration: number
    classroomStartDateTime: string
    classroomEndDateTime: string
    attendees: Attendee[]
    availableDurations: { duration: number, human: string }[]
    availablePositions: number[]
    fieldsAreFilled: (state: SchedulingState) => boolean
}
type SchedulingAction =
    | {
    type: ActionType.CLASSROOM_NAME_CHANGED
    classroomName: string
}
    | {
    type: ActionType.SUBJECT_CHANGED
    subject: Subjects
} | {
    type: ActionType.POSITION_CHANGED
    position: number
}
    | {
    type: ActionType.DURATION_UPDATED
    duration: number
}
    | {
    type: ActionType.ATTENDEES_UPDATED
    attendees: Client[]
}
    | {
    type: ActionType.START_DATE_UPDATED
    startDate: Date
}
    | {
    type: ActionType.END_DATE_UPDATED
    endDate: Date
}

type ScheduleInformation = {
    hours: number | undefined,
    minutes: number | undefined,
    key: string,
    date: Date
};

export function schedulingReducer(state: SchedulingState, action: SchedulingAction): SchedulingState {
    const durationAndStartDate = ({hours, minutes, key, date}: ScheduleInformation): SchedulingState => {
        return determineClassroomTimeAndDuration({hours, minutes, key, date})
    }
    const durationAndEndDate = ({hours, minutes, key, date}: ScheduleInformation): SchedulingState => {
        return determineClassroomTimeAndDuration({hours, minutes, key, date})
    }
    const determineClassroomTimeAndDuration = ({hours, minutes, key, date}: ScheduleInformation): SchedulingState => {
        if (hours) {
            const duration = hours * 60 + (minutes || 0);
            const foundAvailableDuration = state.availableDurations.find(availableDuration => availableDuration.duration === duration);
            return !foundAvailableDuration ? {
                ...state,
                [key]: formatISO(roundToNearestMinutes(date, {nearestTo: 5}))
            } : {
                ...state,
                duration,
                [key]: formatISO(roundToNearestMinutes(date, {nearestTo: 5}))
            };
        }
        return {...state, [key]: formatISO(date)}
    }

    switch (action.type) {
        case ActionType.CLASSROOM_NAME_CHANGED:
            return {...state, classroomName: action.classroomName}
        case ActionType.SUBJECT_CHANGED:
            return {...state, subject: action.subject}
        case ActionType.POSITION_CHANGED:
            return {...state, position: action.position}
        case ActionType.DURATION_UPDATED: {
            const startDate = parseISO(state.classroomStartDateTime)
            const endDateTimeAtSameTimeThanStartDateTime = set(parseISO(state.classroomEndDateTime), {
                hours: startDate.getHours(),
                minutes: startDate.getMinutes()
            });
            const classroomEndDateTime = formatISO(addMinutes(endDateTimeAtSameTimeThanStartDateTime, action.duration))
            return {...state, duration: action.duration, classroomEndDateTime}
        }
        case ActionType.ATTENDEES_UPDATED:
            return {
                ...state,
                attendees: action.attendees.map(attendee => ({id: attendee.id})),
                position: action.attendees.length > state.position ? action.attendees.length : state.position
            }
        case ActionType.START_DATE_UPDATED: {
            const {hours, minutes} = intervalToDuration({
                start: roundToNearestMinutes(action.startDate, {nearestTo: 5}),
                end: parseISO(state.classroomEndDateTime)
            });
            return durationAndStartDate({hours, minutes, key: "classroomStartDateTime", date: action.startDate});
        }
        case ActionType.END_DATE_UPDATED: {
            const {hours, minutes} = intervalToDuration({
                start: parseISO(state.classroomStartDateTime),
                end: roundToNearestMinutes(action.endDate, {nearestTo: 5})
            });
            return durationAndEndDate({hours, minutes, key: "classroomEndDateTime", date: action.endDate})
        }
    }
}

export function updateClassroomName(classroomName: string): SchedulingAction {
    return {classroomName, type: ActionType.CLASSROOM_NAME_CHANGED}
}

export function updateSubject(subject: Subjects): SchedulingAction {
    return {subject, type: ActionType.SUBJECT_CHANGED}
}

export function updatePosition(position: number): SchedulingAction {
    return {position, type: ActionType.POSITION_CHANGED}
}

export function updateDuration(duration: number): SchedulingAction {
    return {duration, type: ActionType.DURATION_UPDATED}
}

export function updateAttendees(attendees: Client[]): SchedulingAction {
    return {attendees, type: ActionType.ATTENDEES_UPDATED}
}

export function updateClassroomStartDate(startDate: Date): SchedulingAction {
    return {startDate, type: ActionType.START_DATE_UPDATED}
}

export function updateClassroomEndDate(endDate: Date): SchedulingAction {
    return {endDate, type: ActionType.END_DATE_UPDATED}
}