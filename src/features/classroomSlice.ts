import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiClassroom, api } from "../api";
import map_action_thunk_error, { ApiError, ErrorMessage } from "./errors";
import { Subjects } from "./domain/subjects";
import { Classroom } from "./domain/classroom";
import { RootState } from "../app/store";
import { Attendee } from "./domain/session";

export enum ClassroomStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  ADD_ATTENDEES_SUCCEEDED = "ADD_ATTENDEES_SUCCEEDED",
  ADD_ATTENDEES_FAILED = "ADD_ATTENDEES_FAILED",
}

interface ClassroomState {
  classrooms: Classroom[];
  status:
    | ClassroomStatus.IDLE
    | ClassroomStatus.LOADING
    | ClassroomStatus.FAILED
    | ClassroomStatus.SUCCEEDED
    | ClassroomStatus.ADD_ATTENDEES_SUCCEEDED
    | ClassroomStatus.ADD_ATTENDEES_FAILED;
  error: ErrorMessage[];
}

const initialState: ClassroomState = {
  classrooms: [],
  status: ClassroomStatus.IDLE,
  error: [],
};

const mapToApiClassroom = (classroom: Classroom): ApiClassroom => {
  return {
    ...classroom,
    name: classroom.classroomName,
    start_date: classroom.startDate,
    stop_date: classroom.endDate,
    duration: {
      duration: classroom.duration,
      unit: "MINUTE",
    },
  };
};

const mapToClassroom = (classroom: ApiClassroom): Classroom => {
  return {
    ...classroom,
    subject: classroom.subject as Subjects,
    classroomName: classroom.name,
    startDate: classroom.start_date,
    endDate: classroom.stop_date,
    duration: classroom.duration.duration,
  };
};

export const addClassroom = createAsyncThunk<
  Classroom | undefined,
  Classroom,
  { rejectValue: ErrorMessage[] }
>("classroom/add", async (classroom, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const response = await api("/classrooms", {
      customConfig: {
        body: JSON.stringify(mapToApiClassroom(classroom)),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.token.token}`,
        },
      },
    });
    return mapToClassroom(response.data as ApiClassroom) as Classroom;
  } catch (e) {
    return thunkAPI.rejectWithValue(
      map_action_thunk_error(
        `Classroom '${classroom.classroomName}' creation`,
        e as ApiError
      )
    );
  }
});

interface AttendeesToAdd {
  classroomId: string;
  attendees: Attendee[];
}

export const addAttendeesToClassroom = createAsyncThunk<
  { test: string },
  AttendeesToAdd,
  { rejectValue: ErrorMessage[] }
>("classroom/attendees/add", async (attendeesToAdd, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    await api(`/classrooms/${attendeesToAdd.classroomId}`, {
      customConfig: {
        body: JSON.stringify({
          attendees: attendeesToAdd.attendees.map((attendee) => ({
            id: attendee.id,
          })),
        }),
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.token.token}`,
        },
      },
    });
    return { test: "" };
  } catch (e) {
    return thunkAPI.rejectWithValue(
      map_action_thunk_error(`Add attendee to classroom`, e as ApiError)
    );
  }
});

const classroomsSlice = createSlice({
  name: "classrooms",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(addClassroom.fulfilled, (state, action) => {
        state.status = ClassroomStatus.SUCCEEDED;
        state.classrooms.push(action.payload as Classroom);
      })
      .addCase(addClassroom.rejected, (state, action) => {
        state.status = ClassroomStatus.FAILED;
        state.error = action.payload as ErrorMessage[];
      })
      .addCase(addAttendeesToClassroom.fulfilled, (state, action) => {
        state.status = ClassroomStatus.ADD_ATTENDEES_SUCCEEDED;
      });
  },
});

export default classroomsSlice.reducer;
