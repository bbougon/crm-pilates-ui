import {FulFilledAction} from "../../test-utils/features/actionFixtures";
import reducer from "../sessionsSlice";
import {fetchSessions} from "../sessionsSlice";
import {LoadingState} from "../../test-utils/features/sessions/sessionsStateFixtures";

describe("SessionsSlice", () =>{

    describe("Fetching sessions", () => {
        it("should get links header", () => {
            const previousState = new LoadingState().build()
            const action = new FulFilledAction(fetchSessions).withPayload([]).withMeta({link :'</sessions?from=previous>; rel="previous", </sessions?from=current>; rel="current", </sessions?from=next>; rel="next"'}).build()

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
    })
})