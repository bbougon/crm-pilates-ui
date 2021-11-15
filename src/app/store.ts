import {configureStore} from "@reduxjs/toolkit";
import clientsReducer from "../features/clientsSlice";
import sessionsReducer from "../features/sessionsSlice";
import classroomsReducer from "../features/classroomSlice";

/* eslint-disable no-underscore-dangle */
export const store =  configureStore({
    reducer: {
        clients: clientsReducer,
        sessions: sessionsReducer,
        classrooms: classroomsReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/* eslint-enable */