import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";

export const clientStatuses = {
    LOADING: "loading",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
    CREATION_FAILED: "creationFailed"
}

const initialState = {
    clients: [],
    status: null,
    error: null
}

export const createClient = createAsyncThunk(
    'clients/create',
    async (client, {rejectWithValue, fulfillWithValue}) => {
        try {
            const response = await api.createClient(client)
            return fulfillWithValue(response.data)
        } catch (e) {
            return rejectWithValue(e)
        }
    }
)

export const fetchClients = createAsyncThunk(
    'clients/fetch',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await api.fetchClients()
            return fulfillWithValue(response.data, null)
        } catch (e) {
            return rejectWithValue(e)
        }

    }
)

const clientsSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchClients.pending, (state, action) => {
                state.status = clientStatuses.LOADING
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.status = clientStatuses.SUCCEEDED
                state.clients = action.payload
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.status = clientStatuses.FAILED
                state.error = map_action_thunk_error(action)
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.status = clientStatuses.SUCCEEDED
                state.clients.push(action.payload)
            })
            .addCase(createClient.rejected, (state, action) => {
                state.status = clientStatuses.CREATION_FAILED
                state.error = map_action_thunk_error(action)
            })
    }
})

export const selectAllClients = (state) => state.clients.clients

export default clientsSlice.reducer