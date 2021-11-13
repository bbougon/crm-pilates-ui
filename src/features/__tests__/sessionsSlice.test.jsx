import {FulFilledAction} from "../../test-utils/features/actionFixtures";
import reducer, {fetchSessions} from "../sessionsSlice";
import {LoadingState} from "../../test-utils/features/sessions/sessionsStateFixtures";
import {ApiSessionsBuilder, attendee, SessionBuilder, SessionsBuilder} from "../../test-utils/classroom/session";
import {addHours, format, formatISO, subHours} from "date-fns";

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
                error: null,
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
                    new ApiSessionsBuilder().withClassroom(1).withName('Pilates avancé')
                        .withScheduleAsString(formatISO(subHours(currentDate, 5))).withPosition(3)
                        .withAttendee(attendee(1, "Laurent", "Gas", "CHECKED_IN"))
                        .withAttendee(attendee(2, "Pierre", "Bernard", "REGISTERED"))
                        .build()
                )
                .build()
            const previousState = new LoadingState().build()
            const action = new FulFilledAction(fetchSessions)
                .withPayload({sessions: sessions, link :'</sessions?from=previous>; rel="previous", </sessions?from=current>; rel="current", </sessions?from=next>; rel="next"'})
                .build()

            let startDate = subHours(currentDate, 5);
            expect(reducer(previousState, action)).toEqual({
                sessions: [{
                    classroomId: 1,
                    name: "Pilates avancé",
                    schedule: {start: format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX"), stop: format(addHours(startDate, 1), "yyyy-MM-dd'T'HH:mm:ssXXX")},
                    position: 3,
                    attendees: [
                        {id: 1, firstname: "Laurent", lastname: "Gas", attendance: "CHECKED_IN"},
                        {id: 2, firstname: "Pierre", lastname: "Bernard", attendance: "REGISTERED"}
                    ]
                }],
                status: "succeeded",
                error: null,
                link: {
                    current: {url: "/sessions?from=current"},
                    next: {url: "/sessions?from=next"},
                    previous: {url: "/sessions?from=previous"},
                }
            })
        })
    })
})