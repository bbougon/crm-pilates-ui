import {afterAll, beforeAll, describe, expect, it, vitest} from "vitest";
import {FulFilledAction, IdleAction, RejectedAction} from "../../test-utils/features/actionFixtures";
import reducer, {AuthState, AuthStatus, getAuthToken, login} from "../auth";
import {RootState} from "../../app/store";

describe('Authentication reducer', () => {

    it('should store token into browser session storage', async () => {
        const previousState: AuthState = {token: {token: "", type: "bearer"}, status: AuthStatus.IDLE, error: []}
        const token = {token: 'my-token', type: "bearer"}
        const action = new FulFilledAction(login).withPayload(token).build()

        expect(reducer(previousState, action)).toEqual({
            token,
            status: "succeeded",
            error: []
        })
        expect(sessionStorage.getItem("token")).toEqual(JSON.stringify({token: 'my-token', type: "bearer"}))
    })

    it('should remove token from session storage if authentication fails', async () => {
        const previousState: AuthState = {token: {token: "my-token", type: "bearer"}, status: AuthStatus.IDLE, error: []}
        const token = {token: '', type: "bearer"}
        const action = new RejectedAction(login).withErrorPayload({detail: [{msg: "Unauthorized", type: "create_token"}]}).build()

        expect(reducer(previousState, action)).toEqual({
            token,
            status: "failed",
            error: [{message: "Unauthorized", origin: "Create token", type: "create_token"}]
        })
        expect(sessionStorage.getItem("token")).toBeNull()
    })

    it('should retrieve token from selector', async () => {
        const rootState: AuthState = {token: {token: "my-token", type: "bearer"}, status: AuthStatus.SUCCEEDED, error: []}

        expect(getAuthToken({login: rootState} as RootState)).toEqual({token: 'my-token', type: "bearer"})
    })

    describe('Session storage', () => {

        beforeAll(() => {
            vitest.mock('date-fns', () => ({
                compareAsc: vitest.fn().mockReturnValue(1),
                fromUnixTime: vitest.fn()
            }))
            vitest.mock('jwt-decode', () => ({default: vitest.fn().mockReturnValue({exp: new Date().getTime()})}))
        })

        afterAll(() => {
            vitest.restoreAllMocks()
        })

        it('should retrieve token from selector with session storage', async () => {
            sessionStorage.setItem("token", JSON.stringify({token: "my-token", type: "bearer"}))
            const rootState: AuthState = {token: {token: "", type: "bearer"}, status: AuthStatus.IDLE, error: []}

            expect(getAuthToken({login: rootState} as RootState)).toEqual({token: 'my-token', type: "bearer"})
        })

        it('should initialise auth state with session storage', async () => {
            const token = {token: "my-token", type: "bearer"};
            sessionStorage.setItem("token", JSON.stringify(token))
            const previousState: AuthState = {token: {token: "", type: "bearer"}, status: AuthStatus.IDLE, error: []}
            const action = new IdleAction(login).build()

            expect(reducer(previousState, action)).toEqual({
                token,
                status: "idle",
                error: []
            })
        })
    })
})