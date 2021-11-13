import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import {RootState} from "../app/store";

export enum ClientStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    CREATION_FAILED = "creationFailed"
}

export interface ClientState {
    clients: Client[];
    status: ClientStatus.IDLE | ClientStatus.LOADING | ClientStatus.SUCCEEDED | ClientStatus.FAILED | ClientStatus.CREATION_FAILED;
    error: ErrorMessage[]
}

const initialState: ClientState = {
    clients: [],
    status: ClientStatus.IDLE,
    error: []
}

export interface Client {
    firstname: string
    lastname: string
    id: string
}

export interface ClientCreation {
    firstname: string
    lastname: string
}

export const createClient = createAsyncThunk<Client, ClientCreation, {rejectValue: ApiError}>(
    'clients/create',
    async (client, thunkAPI) => {
        try {
            const response = await api.createClient(client)
            return response.data as Client
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }
    }
)

export const fetchClients = createAsyncThunk<Client[], undefined, {rejectValue: ApiError}>(
    'clients/fetch',
    async (_, thunkAPI) => {
        try {
            const response = await api.fetchClients()
            return response.data
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e)
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
                state.status = ClientStatus.LOADING
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.status = ClientStatus.SUCCEEDED
                state.clients = action.payload
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.status = ClientStatus.FAILED
                state.error = map_action_thunk_error(action.payload as ApiError)
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.status = ClientStatus.SUCCEEDED
                state.clients.push(action.payload)
            })
            .addCase(createClient.rejected, (state, action) => {
                state.status = ClientStatus.CREATION_FAILED
                state.error = map_action_thunk_error(action.payload as ApiError)
            })
    }
})

export const selectAllClients = (state: RootState) => state.clients.clients

export default clientsSlice.reducer