import React from 'react'
import {act, render as rtlRender} from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import clientsReducer from "../features/clientsSlice"
import sessionsReducer from "../features/sessionsSlice"
import classroomsReducer from "../features/classroomSlice"
import loginReducer from "../features/auth"
import PropTypes from "prop-types";

const reducer = {
    sessions: sessionsReducer,
    clients: clientsReducer,
    classrooms: classroomsReducer,
    login: loginReducer
}

function render(
    ui,
    {
        preloadedState,
        store = configureStore({ reducer: reducer, preloadedState }),
        ...renderOptions
    } = {}
) {
    const Wrapper = ({ children }) => {
        return <Provider store={store}>{children}</Provider>
    }
    Wrapper.propTypes = {
        children: PropTypes.node.isRequired
    }
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

export async function actThenSleep(ms) {
    return await act(() => sleep(ms));
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export * from '@testing-library/react'
export { render }