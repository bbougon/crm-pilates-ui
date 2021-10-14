import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";

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
    async () => {
        const response = await api.fetchClients()
        return response.data
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
                state.clients = state.clients = action.payload
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.clients.push(action.payload)
            })
    }
})

export const selectAllClients = (state) => state.clients.clients

export default clientsSlice.reducer