import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiClassroom, api } from "../api";
import map_action_thunk_error, { ApiError, ErrorMessage } from "./errors";
import { Subjects } from "./domain/subjects";
import { Classroom } from "./domain/classroom";
import { RootState } from "../app/store";

export enum ClassroomStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

interface ClassroomState {
  classrooms: Classroom[];
  status:
    | ClassroomStatus.IDLE
    | ClassroomStatus.LOADING
    | ClassroomStatus.FAILED
    | ClassroomStatus.SUCCEEDED;
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
      });
  },
});

export default classroomsSlice.reducer;
