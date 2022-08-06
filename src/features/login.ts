import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import {api, ApiToken} from "../api";
import { Token } from "./domain/token";

export enum LoginStatus {
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    IDLE = "idle",
}

export interface Login {
    username: string
    password: string
}

interface LoginState {
    token: Token,
    status: LoginStatus,
    error: ErrorMessage[]
}

const initialState: LoginState = {
    token: {token: "", type: "bearer"},
    status: LoginStatus.IDLE,
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

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.status = LoginStatus.SUCCEEDED
                state.token = action.payload as Token
            })
            .addCase(login.rejected, (state, action) => {
                state.status = LoginStatus.FAILED
                state.error = map_action_thunk_error("Create token", action.payload as ApiError)
            })
    }
})

export default loginSlice.reducer