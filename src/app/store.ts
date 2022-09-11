import {configureStore} from "@reduxjs/toolkit";
import clientsReducer from "../features/clientsSlice";
import sessionsReducer from "../features/sessionsSlice";
import classroomsReducer from "../features/classroomSlice";
import loginReducer from "../features/auth";

/* eslint-disable no-underscore-dangle */
export const store =  configureStore({
    reducer: {
        clients: clientsReducer,
        sessions: sessionsReducer,
        classrooms: classroomsReducer,
        login: loginReducer
    },
})

export type RootState = ReturnType<typeof store.getState>

/* eslint-enable */