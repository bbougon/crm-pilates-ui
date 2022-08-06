import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import {api, ApiToken} from "../api";
import { Token } from "./domain/token";

export enum AuthStatus {
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    IDLE = "idle",
}

export interface Login {
    username: string
    password: string
}

interface AuthState {
    token: Token,
    status: AuthStatus,
    error: ErrorMessage[]
}

const initialState: AuthState = {
    token: {token: "", type: "bearer"},
    status: AuthStatus.IDLE,
    error: [],
}

export const login = createAsyncThunk<ApiToken, Login, { rejectValue: ApiError }>(
    'login', async (login, thunkAPI) => {
        try {
            const response = await api.login(login)
            return response.data as ApiToken
        } catch (e) {
            return thunkAPI.rejectWithValue(e as ApiError)
        }
    })

const authSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.status = AuthStatus.SUCCEEDED
                state.token = action.payload as Token
            })
            .addCase(login.rejected, (state, action) => {
                state.status = AuthStatus.FAILED
                state.error = map_action_thunk_error("Create token", action.payload as ApiError)
            })
    }
})

export default authSlice.reducer