import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";

const initialState = {
    clients: [],
    status: null,
    error: null
}

export const createClient = createAsyncThunk(
    'clients/create',
    async (client) => {
        const response = await api.createClient(client)
        return response.data
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
                state.status = 'loading'
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.clients = action.payload
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.status = 'failed'
                state.error = map_action_thunk_error(action)
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.clients.push(action.payload)
            })
    }
})

export const selectAllClients = (state) => state.clients.clients

export default clientsSlice.reducer