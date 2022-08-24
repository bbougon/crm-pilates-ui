import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api, ApiAttendee, ApiSession} from "../api";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import {isEqual, parseISO} from "date-fns";
import {RootState} from "../app/store";
import {Attendance, Attendee, Session, SessionsLink} from "./domain/session";
import {Subjects} from "./domain/subjects";
import parseLinkHeader from "parse-link-header";

export enum SessionStatus {
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    CHECKIN_IN_PROGRESS = "checkinInProgress",
    CHECKIN_IN_SUCCEEDED = "checkinInSucceeded",
    IDLE = "idle",
    CHECKIN_IN_FAILED = "checkInFailed",
    CHECKOUT_IN_PROGRESS = "checkOutFailed",
    CHECKOUT_FAILED = "checkOutFailed",
    CHECKOUT_SUCCEEDED = "checkOutSucceeded",
    CANCEL_SUCCEEDED = "revokeSucceeded"
}

export interface SessionState {
    sessions: Session[],
    status: SessionStatus.IDLE | SessionStatus.CHECKIN_IN_PROGRESS | SessionStatus.CHECKIN_IN_FAILED | SessionStatus.CHECKIN_IN_SUCCEEDED
        | SessionStatus.SUCCEEDED | SessionStatus.LOADING | SessionStatus.FAILED | SessionStatus.CHECKOUT_SUCCEEDED | SessionStatus.CHECKOUT_FAILED
        | SessionStatus.CHECKOUT_IN_PROGRESS | SessionStatus.CANCEL_SUCCEEDED,
    error: ErrorMessage[],
    link: SessionsLink | undefined
}

const initialState: SessionState = {
    sessions: [],
    status: SessionStatus.IDLE,
    error: [],
    link: undefined
}

export interface Checkin {
    classroomId: string
    start: string
    attendeeId: string
}

export interface Cancel {
    classroomId: string
    start: string
    attendeeId: string
}


export interface Checkout {
    sessionId: string
    attendeeId: string
}

export const fetchSessions = createAsyncThunk<{ sessions: ApiSession[], link: string | null }, string | undefined, { rejectValue: ApiError }>(
    'sessions/fetch',
    async (link = "/sessions", thunkAPI) => {
        try {
            const {login} = thunkAPI.getState() as unknown as RootState;
            const response = await api(link, {
                customConfig: {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${login.token.token}`}
                }
            })
            return {sessions: response.data as ApiSession[], link: response.headers.get("X-Link")}
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }

    }
)

export const sessionCheckin = createAsyncThunk<ApiSession, Checkin, { rejectValue: ApiError }>(
    'sessions/checkin',
    async (checkin, thunkAPI) => {
        try {
            const {login} = thunkAPI.getState() as unknown as RootState;
            const body = JSON.stringify({
                classroom_id: checkin.classroomId,
                session_date: checkin.start,
                attendee: checkin.attendeeId
            });
            const customConfig = {
                body,
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${login.token.token}`}
            }
            const response = await api("/sessions/checkin", {customConfig})
            return response.data as ApiSession
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }
    }
)

export const sessionCheckout = createAsyncThunk<ApiSession, Checkout, { rejectValue: ApiError }>(
    'sessions/checkout',
    async (checkout, thunkAPI) => {
        try {
            const {login} = thunkAPI.getState() as unknown as RootState;
            const body = JSON.stringify({
                attendee: checkout.attendeeId
            });
            const customConfig = {
                body,
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${login.token.token}`}
            }
            const response = await api(`/sessions/${checkout.sessionId}/checkout`, {customConfig})
            return response.data as ApiSession
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }
    }
)

export const sessionCancel = createAsyncThunk<ApiSession, Cancel, { rejectValue: ApiError }>(
    'sessions/revoke',
    async (cancel, thunkAPI) => {
        try {
            const {login} = thunkAPI.getState() as unknown as RootState;
            const body = JSON.stringify({
                classroom_id: cancel.classroomId,
                session_date: cancel.start
            });
            const customConfig = {
                body,
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${login.token.token}`}
            }
            const response = await api(`/sessions/cancellation/${cancel.attendeeId}`, {customConfig})
            return response.data as ApiSession
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }
    }
)

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {},
    extraReducers(builder) {
        const mapAttendee = (attendee: ApiAttendee): Attendee => {
            return {
                id: attendee.id,
                firstname: attendee.firstname,
                lastname: attendee.lastname,
                attendance: attendee.attendance as Attendance,
                credits: {amount: attendee.credits?.amount}
            }
        }
        const mapSession = (apiSession: ApiSession): Session => {

            return {
                id: apiSession.id,
                classroomId: apiSession.classroom_id,
                name: apiSession.name,
                subject: apiSession.subject as Subjects,
                schedule: {
                    start: apiSession.schedule.start,
                    stop: apiSession.schedule.stop
                },
                position: apiSession.position,
                attendees: apiSession.attendees?.map(attendee => mapAttendee(attendee))
            }
        }

        function mapAttendees(session: Session | undefined, apiSession: ApiSession) {
            if (session) {
                session.attendees = apiSession.attendees?.map(attendee => mapAttendee(attendee))
                session.id = apiSession.id
            }
        }

        function mapCredits(sessions: Session[], apiSession: ApiSession) {
            sessions.filter(session => session.subject as Subjects === apiSession.subject as Subjects).forEach(session => {
                apiSession.attendees?.forEach(attendee => {
                    session.attendees?.forEach(sessionAttendee => {
                        if (sessionAttendee.id === attendee.id) {
                            sessionAttendee.credits = attendee.credits
                        }
                    })
                })
            })
        }

        builder
            .addCase(fetchSessions.pending, (state, action) => {
                state.status = SessionStatus.LOADING
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.status = SessionStatus.SUCCEEDED

                state.sessions = action.payload.sessions.map(apiSession => mapSession(apiSession))
                const links = (): SessionsLink => {
                    const links = parseLinkHeader(action.payload.link)
                    return {
                        current: {url: links?.current.url || ""},
                        next: {url: links?.next.url || ""},
                        previous: {url: links?.previous.url || ""}
                    }
                };
                state.link = links()
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = SessionStatus.FAILED
                state.error = map_action_thunk_error("Get sessions", action.payload as ApiError)
            })
            .addCase(sessionCheckin.pending, (state, action) => {
                state.status = SessionStatus.CHECKIN_IN_PROGRESS
            })
            .addCase(sessionCheckin.rejected, (state, action) => {
                state.status = SessionStatus.CHECKIN_IN_FAILED
                state.error = map_action_thunk_error("Checkin", action.payload as ApiError)
            })
            .addCase(sessionCheckin.fulfilled, (state, action) => {
                state.status = SessionStatus.CHECKIN_IN_SUCCEEDED
                const sessionCheckedin = action.payload
                const session = state.sessions.find(session => session.id === sessionCheckedin.id
                    || (session.classroomId === sessionCheckedin.classroom_id && isEqual(parseISO(`${session.schedule.start}`), parseISO(`${sessionCheckedin.schedule.start}`))));
                mapAttendees(session, sessionCheckedin)
                mapCredits(state.sessions, sessionCheckedin);
            })
            .addCase(sessionCheckout.pending, (state, action) => {
                state.status = SessionStatus.CHECKOUT_IN_PROGRESS
            })
            .addCase(sessionCheckout.rejected, (state, action) => {
                state.status = SessionStatus.CHECKOUT_FAILED
                state.error = map_action_thunk_error("Checkout", action.payload as ApiError)
            })
            .addCase(sessionCheckout.fulfilled, (state, action) => {
                state.status = SessionStatus.CHECKOUT_SUCCEEDED
                const sessionCheckedOut = action.payload
                const session = state.sessions.find(session => session.id === sessionCheckedOut.id);
                mapAttendees(session, sessionCheckedOut);
                mapCredits(state.sessions, sessionCheckedOut)
            })
            .addCase(sessionCancel.fulfilled, (state, action) => {
                state.status = SessionStatus.CANCEL_SUCCEEDED
                const sessionCancelled = action.payload
                const session = state.sessions.find(session => session.id === sessionCancelled.id
                    || (session.classroomId === sessionCancelled.classroom_id && isEqual(parseISO(`${session.schedule.start}`), parseISO(`${sessionCancelled.schedule.start}`))));
                if(session) {
                    session.attendees = sessionCancelled.attendees?.map(attendee => mapAttendee(attendee))
                    session.id = sessionCancelled.id
                }
            })
    }
})

export const selectMonthlySessions = (state: RootState) => state.sessions.sessions

export default sessionsSlice.reducer