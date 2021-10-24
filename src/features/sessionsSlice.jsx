import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";
import {attendee, SessionBuilder, SessionsBuilder} from "../test-utils/classroom/session";
import {subHours} from "date-fns";
import parse from "parse-link-header"

export const sessionStatuses = {
    LOADING: "loading",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
}
const sessions = new SessionsBuilder()
    .withSession(
        new SessionBuilder().withClassroom(1).withName('Pilates avancé')
            .withSchedule(subHours(new Date(), 5)).withPosition(3)
            .withAttendee(attendee(1, "Laurent", "Gas", "CHECKED_IN"))
            .withAttendee(attendee(2, "Pierre", "Bernard", "REGISTERED"))
            .build()
    )
    .withSession(
        new SessionBuilder().withId(1).withClassroom(1).withName('Pilates machine')
            .withSchedule(subHours(new Date(), 4)).withPosition(3)
            .withAttendee(attendee(3, "Bertrand", "Bougon", "REGISTERED"))
            .build()
    )
    .withSession(
        new SessionBuilder().withId(2).withClassroom(2).withName('Pilates tapis')
            .withSchedule(subHours(new Date(), 3)).withPosition(4)
            .build()
    )
    .withSession(
        new SessionBuilder().withClassroom(3).withName('Cours duo')
            .withSchedule(subHours(new Date(), 2)).withPosition(2)
            .build()
    )
    .withSession(
        new SessionBuilder().withId(13).withClassroom(1).withName('Cours trio')
            .withSchedule(subHours(new Date(), 1)).withPosition(3)
            .build()
    )
    .withSession(
        new SessionBuilder().withId(4).withClassroom(1).withName('Cours privé')
            .withSchedule(new Date()).withPosition(1)
            .withAttendee(attendee(3, "Bertrand", "Bougon", "CHECKED_IN"))
            .build()
    )
    .build()

const initialState = {
    sessions: sessions,
    status: null,
    error: null,
    link: null
}


export const fetchSessions = createAsyncThunk(
    'sessions/fetch',
    async (queryParams, {rejectWithValue, fulfillWithValue}) => {
        try {
            const response = await api.fetchSessions()
            console.log(JSON.stringify(response.headers.keys()))
            return fulfillWithValue(response.data, {link: response.headers.get("X-Link")})
        } catch (e) {
            return rejectWithValue(e)
        }

    }
)

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchSessions.pending, (state, action) => {
                state.status = sessionStatuses.LOADING
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.status = sessionStatuses.SUCCEEDED
                state.sessions = action.payload
                console.log(JSON.stringify(action.meta))
                let links = () => {
                    const links = parse(action.meta.link)
                    return {current: {url: links.current.url}, next: {url: links.next.url}, previous: {url: links.previous.url}}
                };
                state.link = links()
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = sessionStatuses.FAILED
                state.error = map_action_thunk_error(action)
            })
    }
})

export const selectMonthlySessions = (state) => state.sessions.sessions

export default sessionsSlice.reducer