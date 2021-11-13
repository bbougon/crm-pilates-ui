import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import parse from "parse-link-header"
import {isEqual, parseISO} from "date-fns";
import {RootState} from "../app/store";

export enum SessionStatus {
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    CHECKIN_IN_PROGRESS = "chekinInProgress",
    CHECKIN_IN_SUCCEEDED = "chekinInSucceeded",
    IDLE = "idle",
}

export interface SessionState {
    sessions: Session[],
    status: SessionStatus.IDLE | SessionStatus.CHECKIN_IN_PROGRESS | SessionStatus.CHECKIN_IN_SUCCEEDED | SessionStatus.SUCCEEDED | SessionStatus.LOADING | SessionStatus.FAILED,
    error: ErrorMessage[],
    link: Link | undefined
}

const initialState: SessionState = {
    sessions: [],
    status: SessionStatus.IDLE,
    error: [],
    link: undefined
}

export interface ApiAttendee {
    id: string;
    firstname: string;
    lastname: string;
    attendance: string;
}

export interface ApiSession {
    id?: string
    name: string
    classroom_id: string
    position: number
    schedule: {
        start: string
        stop: string
    }
    attendees?: [ApiAttendee]
}

export interface Session {
    id?: string | undefined
    classroomId: string
    name: string
    schedule: {
        start: string
        stop?: string | undefined
    }
    position: number
    attendees?: Attendee[]
}

export enum Attendance {
    REGISTERED = "REGISTERED",
    CHECKED_IN = "CHECKED_IN"
}

export interface Attendee {
    id: string
    firstname: string
    lastname: string
    attendance: Attendance
}

export interface Link {
    current: { url: string }
    next: { url: string }
    previous: { url: string }
}

export interface Checkin {
    classroomId: string
    start: string
    attendeeId: string
}


export const fetchSessions = createAsyncThunk<{ sessions: ApiSession[], link: string | null }, string | undefined, { rejectValue: ApiError }>(
    'sessions/fetch',
    async (link = "/sessions", thunkAPI) => {
        try {
            const response = await api.fetchSessions(link)
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
            const response = await api.sessionCheckin(checkin)
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
        const mapAttendee = (attendee: { id: string; firstname: string; lastname: string; attendance: string }): Attendee => {
            return {
                id: attendee.id,
                firstname: attendee.firstname,
                lastname: attendee.lastname,
                attendance: attendee.attendance as Attendance
            }
        }
        const mapSession = (apiSession: ApiSession):Session => {

            return {
                id: apiSession.id,
                classroomId: apiSession.classroom_id,
                name: apiSession.name,
                schedule: {
                    start: apiSession.schedule.start,
                    stop: apiSession.schedule.stop
                },
                position: apiSession.position,
                attendees: apiSession.attendees?.map(attendee => mapAttendee(attendee))
            }
        }

        builder
            .addCase(fetchSessions.pending, (state, action) => {
                state.status = SessionStatus.LOADING
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.status = SessionStatus.SUCCEEDED

                state.sessions = action.payload.sessions.map(apiSession => mapSession(apiSession))
                let links = (): Link => {
                    const links = parse(action.payload.link)
                    return {
                        current: {url: links.current.url},
                        next: {url: links.next.url},
                        previous: {url: links.previous.url}
                    }
                };
                state.link = links()
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = SessionStatus.FAILED
                state.error = map_action_thunk_error(action.payload as ApiError)
            })
            .addCase(sessionCheckin.pending, (state, action) => {
                state.status = SessionStatus.CHECKIN_IN_PROGRESS
            })
            .addCase(sessionCheckin.fulfilled, (state, action) => {
                state.status = SessionStatus.CHECKIN_IN_SUCCEEDED
                const sessionCheckedin = action.payload
                let session = state.sessions.find(session => session.id === sessionCheckedin.id
                    || (session.classroomId === sessionCheckedin.classroom_id && isEqual(parseISO(`${session.schedule.start}`), parseISO(`${sessionCheckedin.schedule.start}`))));
                if (session) {
                    session.attendees = sessionCheckedin.attendees?.map(attendee => mapAttendee(attendee))
                    session.id = sessionCheckedin.id
                }
            })
    }
})

export const selectMonthlySessions = (state: RootState) => state.sessions.sessions

export default sessionsSlice.reducer