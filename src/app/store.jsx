import {configureStore} from "@reduxjs/toolkit";
import clientsReducer from "../features/clientsSlice";
import sessionsReducer from "../features/sessionsSlice";

export default configureStore({
    reducer: {
        clients: clientsReducer,
        sessions: sessionsReducer
    },
})