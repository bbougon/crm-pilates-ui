import React from 'react'
import {act, render as rtlRender} from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import clientsReducer from "../features/clientsSlice"
import sessionsReducer from "../features/sessionsSlice"
import classroomsReducer from "../features/classroomSlice"
// Import your own reducer

const reducer = {
    sessions: sessionsReducer,
    clients: clientsReducer,
    classrooms: classroomsReducer
}

function render(
    ui,
    {
        preloadedState,
        store = configureStore({ reducer: reducer, preloadedState }),
        ...renderOptions
    } = {}
) {
    function Wrapper({ children }) {
        return <Provider store={store}>{children}</Provider>
    }
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

export async function actThenSleep(ms) {
    await act(() => sleep(20));
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export * from '@testing-library/react'
export { render }