import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../api";
import {map_action_thunk_error} from "./errors";
import parse from "parse-link-header"
import {parseISO} from "date-fns";
import {collapseClasses} from "@mui/material";

export const classroomStatuses = {
    LOADING: "loading",
    SUCCEEDED: "succeeded",
    FAILED: "failed",
}

const initialState = {
    classrooms: [],
    status: null,
    error: null,
}


export const addClassroom = createAsyncThunk(
    'classroom/add',
    async (classroom, {rejectWithValue, fulfillWithValue}) => {
        try {
            const body = (classroom) => {
                return {
                    name: classroom.classroomName,
                    position: classroom.position,
                    start_date: classroom.classroomStartDateTime,
                    stop_date: classroom.classroomEndDateTime,
                    duration: {
                        duration: classroom.duration,
                        unit: "MINUTE"
                    },
                    attendees: classroom.attendees.map(attendee => attendee.id)
                }
            }
            const response = await api.addClassroom(body(classroom))
            return fulfillWithValue(response.data)
        } catch (e) {

        }
    }
)

const classroomsSlice = createSlice({
    name: 'classrooms',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(addClassroom.fulfilled, (state, action) => {
                state.status = classroomStatuses.SUCCEEDED
                state.classrooms.push(action.payload)
            })
    }
})

export const selectClassrooms = (state) => state.classrooms.classrooms

export default classroomsSlice.reducer