import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";

export const sessionStatuses = {
    LOADING: "loading",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
}

const initialState = {
    sessions: [],
    status: null,
    error: null
}


export const fetchSessions = createAsyncThunk(
    'sessions/fetch',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await api.fetchSessions()
            return fulfillWithValue(response.data, null)
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
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.status = sessionStatuses.FAILED
                state.error = map_action_thunk_error(action)
            })
    }
})

export const selectMonthlySessions = (state) => state.sessions.sessions

export default sessionsSlice.reducer