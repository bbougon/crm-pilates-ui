import {configureStore} from "@reduxjs/toolkit";
import clientsReducer from "../features/clientsSlice";
import sessionsReducer from "../features/sessionsSlice";

/* eslint-disable no-underscore-dangle */
export default configureStore({
    reducer: {
        clients: clientsReducer,
        sessions: sessionsReducer
    },
}, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

/* eslint-enable */