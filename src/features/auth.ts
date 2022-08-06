import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import map_action_thunk_error, {ApiError, ErrorMessage} from "./errors";
import {api, ApiToken} from "../api";
import {Token} from "./domain/token";
import {RootState} from "../app/store";

export enum AuthStatus {
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    IDLE = "idle",
}

export interface Login {
    username: string
    password: string
}

export interface AuthState {
    token: Token,
    status: AuthStatus,
    error: ErrorMessage[]
}

const getToken = (): Token => {
    const value = sessionStorage.getItem("token");
    return (sessionStorage && value !== null) ? JSON.parse(value) : {token: "", type: "bearer"};
}

const initializeState = (): AuthState => {
    return {
        token: getToken(),
        status: AuthStatus.IDLE,
        error: [],
    };
}

const initialState: AuthState = initializeState()

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
                sessionStorage.setItem("token", JSON.stringify(state.token))
            })
            .addCase(login.rejected, (state, action) => {
                state.status = AuthStatus.FAILED
                state.error = map_action_thunk_error("Create token", action.payload as ApiError)
                state.token = {token: "", type: "bearer"}
                sessionStorage.removeItem("token")
            })
            .addCase(login.pending, (state, _) => {
                const initializedState: AuthState = initializeState()
                state.status = initializedState.status
                state.error = initializedState.error
                state.token = initializedState.token
            })
    }
})

export const getAuthToken = (state: RootState) => {
    return state.login.token.token ? state.login.token : getToken()
}
export default authSlice.reducer