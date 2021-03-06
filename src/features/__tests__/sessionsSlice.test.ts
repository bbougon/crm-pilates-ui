import {FulFilledAction} from "../../test-utils/features/actionFixtures";
import reducer, {fetchSessions, sessionCheckin, sessionCheckout} from "../sessionsSlice";
import {LoadingState} from "../../test-utils/features/sessions/sessionsStateFixtures";
import {
    apiAttendee,
    ApiSessionsBuilder,
    attendee,
    SessionBuilder,
    SessionsBuilder
} from "../../test-utils/classroom/session";
import {addHours, addWeeks, format, formatISO, subDays, subHours} from "date-fns";
import {Attendance} from "../domain/session";
import {Subjects} from "../domain/subjects";

describe("SessionsSlice", () =>{

    describe("Fetching sessions", () => {
        it("should get links header", () => {
            const previousState = new LoadingState().build()
            const action = new FulFilledAction(fetchSessions)
                .withPayload({sessions: [], link :'</sessions?from=previous>; rel="previous", </sessions?from=current>; rel="current", </sessions?from=next>; rel="next"'})
                .build()

            expect(reducer(previousState, action)).toEqual({
                sessions: [],
                status: "succeeded",
                error: [],
                link: {
                    current: {url: "/sessions?from=current"},
                    next: {url: "/sessions?from=next"},
                    previous: {url: "/sessions?from=previous"},
                }
            })
        })

        it("should map sessions to calendar event", () => {
            const currentDate = new Date()
            const sessions = new SessionsBuilder()
                .withSession(
                    new ApiSessionsBuilder().withClassroom("1").withName('Pilates avancé')
                        .withScheduleAsString(formatISO(subHours(currentDate, 5))).withPosition(3)
                        .withAttendee(apiAttendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 5}))
                        .withAttendee(apiAttendee("2", "Pierre", "Bernard", Attendance.REGISTERED))
                        .build()
                )
                .build()
            const previousState = new LoadingState().build()
            const action = new FulFilledAction(fetchSessions)
                .withPayload({sessions: sessions, link :'</sessions?from=previous>; rel="previous", </sessions?from=current>; rel="current", </sessions?from=next>; rel="next"'})
                .build()

            const startDate = subHours(currentDate, 5);
            expect(reducer(previousState, action)).toEqual({
                sessions: [{
                    classroomId: "1",
                    name: "Pilates avancé",
                    schedule: {start: format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(startDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                    position: 3,
                    attendees: [
                        {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN", credits: {amount: 5}},
                        {id: "2", firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED", credits: {amount: undefined}}
                    ],
                    subject: "MAT"
                }],
                status: "succeeded",
                error: [],
                link: {
                    current: {url: "/sessions?from=current"},
                    next: {url: "/sessions?from=next"},
                    previous: {url: "/sessions?from=previous"},
                }
            })
        })
    })

    describe("Checkin sessions", () => {
        it("should decrease client credits", async () => {
            const currentDate = new Date()
            const sessions = new SessionsBuilder()
                .withSession(
                    new SessionBuilder().withId("1").withClassroom("1").withName('Pilates Trio')
                        .withMachineTrio().withScheduleAsString(formatISO(currentDate)).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 5}))
                        .withAttendee(attendee("2", "Pierre", "Bernard", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId("2").withClassroom("1").withName('Pilates Trio')
                        .withMachineTrio().withScheduleAsString(formatISO(addWeeks(currentDate, 1))).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.REGISTERED, {amount: 5}))
                        .withAttendee(attendee("2", "Pierre", "Bernard", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId("3").withClassroom("3").withName('Pilates avancé')
                        .withScheduleAsString(formatISO(addHours(currentDate, 2))).withPosition(2)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.REGISTERED, {amount: 8}))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId("4").withClassroom("2").withName('Pilates machine')
                        .withMachineTrio().withScheduleAsString(formatISO(subDays(currentDate, 2))).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 5}))
                        .build()
                )
                .build()
            const previousState = new LoadingState().withState(sessions).build()
            const action = new FulFilledAction(sessionCheckin)
                .withPayload(new ApiSessionsBuilder().withId("2").withClassroom("1").withName('Pilates Trio')
                    .withMachineTrio().withScheduleAsString(formatISO(addWeeks(currentDate, 1))).withPosition(3)
                    .withAttendee(apiAttendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 4}))
                    .withAttendee(apiAttendee("2", "Pierre", "Bernard", Attendance.REGISTERED, undefined))
                    .build())
                .build()

            expect(reducer(previousState, action)).toEqual({
                sessions: [
                    {
                        id: "1",
                        classroomId: "1",
                        name: "Pilates Trio",
                        schedule: {start: format(currentDate, "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(currentDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN", credits: {amount: 4}},
                            {id: "2", firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED"}
                        ],
                        subject: Subjects.MACHINE_TRIO
                    },
                    {
                        id: "2",
                        classroomId: "1",
                        name: "Pilates Trio",
                        schedule: {start: format(addWeeks(currentDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(addWeeks(currentDate, 1), 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN", credits: {amount: 4}},
                            {id: "2", firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED"}
                        ],
                        subject: Subjects.MACHINE_TRIO
                    },
                    {
                        id: "3",
                        classroomId: "3",
                        name: "Pilates avancé",
                        schedule: {start: format(addHours(currentDate, 2), "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(currentDate, 3), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 2,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "REGISTERED", credits: {amount: 8}},
                        ],
                        subject: Subjects.MAT
                    },
                    {
                        id: "4",
                        classroomId: "2",
                        name: "Pilates machine",
                        schedule: {start: format(subDays(currentDate, 2), "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(subDays(currentDate, 2), 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN", credits: {amount: 4}},
                        ],
                        subject: Subjects.MACHINE_TRIO
                    }
                ],
                status: "checkinInSucceeded",
                error: []
            })
        })
    })

    describe("Checkout sessions", () => {
        it("should refund client credits", async () => {
            const currentDate = new Date()
            const sessions = new SessionsBuilder()
                .withSession(
                    new SessionBuilder().withId("1").withClassroom("1").withName('Pilates avancé')
                        .withMachineTrio().withScheduleAsString(formatISO(currentDate)).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 5}))
                        .withAttendee(attendee("2", "Pierre", "Bernard", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId("2").withClassroom("1").withName('Pilates avancé')
                        .withMachineTrio().withScheduleAsString(formatISO(addWeeks(currentDate, 1))).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.REGISTERED, {amount: 5}))
                        .withAttendee(attendee("2", "Pierre", "Bernard", Attendance.REGISTERED))
                        .build()
                )
                .withSession(
                    new SessionBuilder().withId("3").withClassroom("2").withName('Pilates machine')
                        .withMachineTrio().withScheduleAsString(formatISO(subDays(currentDate, 2))).withPosition(3)
                        .withAttendee(attendee("1", "Laurent", "Gas", Attendance.CHECKED_IN, {amount: 5}))
                        .build()
                )
                .build()
            const previousState = new LoadingState().withState(sessions).build()
            const action = new FulFilledAction(sessionCheckout)
                .withPayload(new ApiSessionsBuilder().withId("1").withClassroom("1").withName('Pilates avancé')
                    .withMachineTrio().withScheduleAsString(formatISO(addWeeks(currentDate, 1))).withPosition(3)
                    .withAttendee(apiAttendee("1", "Laurent", "Gas", Attendance.REGISTERED, {amount: 6}))
                    .withAttendee(apiAttendee("2", "Pierre", "Bernard", Attendance.REGISTERED, undefined))
                    .build())
                .build()

            expect(reducer(previousState, action)).toEqual({
                sessions: [
                    {
                        id: "1",
                        classroomId: "1",
                        name: "Pilates avancé",
                        schedule: {start: format(currentDate, "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(currentDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "REGISTERED", credits: {amount: 6}},
                            {id: "2", firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED"}
                        ],
                        subject: Subjects.MACHINE_TRIO
                    },
                    {
                        id: "2",
                        classroomId: "1",
                        name: "Pilates avancé",
                        schedule: {start: format(addWeeks(currentDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(addWeeks(currentDate, 1), 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "REGISTERED", credits: {amount: 6}},
                            {id: "2", firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED"}
                        ],
                        subject: Subjects.MACHINE_TRIO
                    },
                    {
                        id: "3",
                        classroomId: "2",
                        name: "Pilates machine",
                        schedule: {start: format(subDays(currentDate, 2), "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(subDays(currentDate, 2), 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                        position: 3,
                        attendees: [
                            {id: "1", firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN", credits: {amount: 6}},
                        ],
                        subject: Subjects.MACHINE_TRIO
                    }
                ],
                status: "checkOutSucceeded",
                error: []
            })
        })
    })
})