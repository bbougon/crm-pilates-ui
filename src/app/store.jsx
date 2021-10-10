import {configureStore} from "@reduxjs/toolkit";
import clientsReducer from "../features/clientsSlice";

export default configureStore({
    reducer: {
        clients: clientsReducer,
    },
})