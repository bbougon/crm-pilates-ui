import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";
import parse from "parse-link-header"
import {parseISO} from "date-fns";

export const sessionStatuses = {
    LOADING: "loading",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
}

const initialState = {
    sessions: [],
    status: null,
    error: null,
    link: null
}


export const fetchSessions = createAsyncThunk(
    'sessions/fetch',
    async (link = "/sessions", {rejectWithValue, fulfillWithValue}) => {
        try {
            const response = await api.fetchSessions(link)
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
                 const map_session = (session) => {
                    return Object.assign({}, session, {date: parseISO(session.schedule.start), schedule: {start: parseISO(session.schedule.start), stop: parseISO(session.schedule.stop)}});
                }

                state.status = sessionStatuses.SUCCEEDED

                state.sessions = action.payload.map(session => map_session(session))
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