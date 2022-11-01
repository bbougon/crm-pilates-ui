import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api, ApiAttendee, ApiSession } from "../api";
import map_action_thunk_error, { ApiError, ErrorMessage } from "./errors";
import { isEqual, parseISO } from "date-fns";
import { RootState } from "../app/store";
import { Attendance, Attendee, Session, SessionsLink } from "./domain/session";
import { Subjects } from "./domain/subjects";
import parseLinkHeader from "parse-link-header";

export enum SessionStatus {
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CHECKIN_IN_PROGRESS = "checkinInProgress",
  CHECKIN_IN_SUCCEEDED = "checkinInSucceeded",
  IDLE = "idle",
  CHECKIN_IN_FAILED = "checkInFailed",
  CHECKOUT_IN_PROGRESS = "checkOutFailed",
  CHECKOUT_FAILED = "checkOutFailed",
  CHECKOUT_SUCCEEDED = "checkOutSucceeded",
  CANCEL_SUCCEEDED = "revokeSucceeded",
}

export interface SessionState {
  sessions: Session[];
  selectedSession: Session | undefined;
  status:
    | SessionStatus.IDLE
    | SessionStatus.CHECKIN_IN_PROGRESS
    | SessionStatus.CHECKIN_IN_FAILED
    | SessionStatus.CHECKIN_IN_SUCCEEDED
    | SessionStatus.SUCCEEDED
    | SessionStatus.LOADING
    | SessionStatus.FAILED
    | SessionStatus.CHECKOUT_SUCCEEDED
    | SessionStatus.CHECKOUT_FAILED
    | SessionStatus.CHECKOUT_IN_PROGRESS
    | SessionStatus.CANCEL_SUCCEEDED;
  error: ErrorMessage[];
  link: SessionsLink | undefined;
}

const initialState: SessionState = {
  sessions: [],
  selectedSession: undefined,
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

export interface Checkin {
  classroomId: string;
  start: string;
  attendeeId: string;
}

export interface Cancel {
  classroomId: string;
  start: string;
  attendeeId: string;
}

export interface Checkout {
  sessionId: string;
  attendeeId: string;
}

export const fetchSessions = createAsyncThunk<
  { sessions: Session[]; link: string | null },
  string | undefined,
  { rejectValue: ApiError }
>("sessions/fetch", async (link = "/sessions", thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const response = await api(link, {
      customConfig: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.token.token}`,
        },
      },
    });
    return {
      sessions: (response.data as ApiSession[]).map((session) =>
        mapSession(session)
      ),
      link: response.headers.get("X-Link"),
    };
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ApiError);
  }
});

export const sessionCheckin = createAsyncThunk<
  Session,
  Checkin,
  { rejectValue: ErrorMessage[] }
>("sessions/checkin", async (checkin, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const body = JSON.stringify({
      classroom_id: checkin.classroomId,
      session_date: checkin.start,
      attendee: checkin.attendeeId,
    });
    const customConfig = {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token.token}`,
      },
    };
    const response = await api("/sessions/checkin", { customConfig });
    return mapSession(response.data as ApiSession);
  } catch (e) {
    return thunkAPI.rejectWithValue(
      map_action_thunk_error(`Checkin could not be completed`, e as ApiError)
    );
  }
});

export const sessionCheckout = createAsyncThunk<
  Session,
  Checkout,
  { rejectValue: ApiError }
>("sessions/checkout", async (checkout, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const body = JSON.stringify({
      attendee: checkout.attendeeId,
    });
    const customConfig = {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token.token}`,
      },
    };
    const response = await api(`/sessions/${checkout.sessionId}/checkout`, {
      customConfig,
    });
    return mapSession(response.data as ApiSession);
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ApiError);
  }
});

export const sessionCancel = createAsyncThunk<
  Session,
  Cancel,
  { rejectValue: ApiError }
>("sessions/revoke", async (cancel, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const body = JSON.stringify({
      classroom_id: cancel.classroomId,
      session_date: cancel.start,
    });
    const customConfig = {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token.token}`,
      },
    };
    const response = await api(`/sessions/cancellation/${cancel.attendeeId}`, {
      customConfig,
    });
    return mapSession(response.data as ApiSession);
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ApiError);
  }
});

export const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {},
  extraReducers(builder) {
    function updateAttendees(
      session: Session | undefined,
      updatedSession: Session
    ) {
      if (session) {
        session.attendees = updatedSession.attendees?.map((attendee) =>
          mapAttendee(attendee)
        );
        session.id = updatedSession.id;
      }
    }

    function updateCredits(sessions: Session[], updatedSession: Session) {
      sessions
        .filter(
          (session) =>
            (session.subject as Subjects) ===
            (updatedSession.subject as Subjects)
        )
        .forEach((session) => {
          updatedSession.attendees?.forEach((attendee) => {
            session.attendees?.forEach((sessionAttendee) => {
              if (sessionAttendee.id === attendee.id) {
                sessionAttendee.credits = attendee.credits;
              }
            });
          });
        });
    }

    function findSession(state: SessionState, expectedSession: Session) {
      return state.sessions.find(
        (session) =>
          session.id === expectedSession.id ||
          (session.classroomId === expectedSession.classroomId &&
            isEqual(
              parseISO(`${session.schedule.start}`),
              parseISO(`${expectedSession.schedule.start}`)
            ))
      );
    }

    builder
      .addCase(fetchSessions.pending, (state, action) => {
        state.status = SessionStatus.LOADING;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = SessionStatus.SUCCEEDED;

        state.sessions = action.payload.sessions;
        const links = (): SessionsLink => {
          const links = parseLinkHeader(action.payload.link);
          return {
            current: { url: links?.current.url || "" },
            next: { url: links?.next.url || "" },
            previous: { url: links?.previous.url || "" },
          };
        };
        state.link = links();
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = SessionStatus.FAILED;
        state.error = map_action_thunk_error(
          "Get sessions",
          action.payload as ApiError
        );
      })
      .addCase(sessionCheckin.pending, (state, action) => {
        state.status = SessionStatus.CHECKIN_IN_PROGRESS;
      })
      .addCase(sessionCheckin.rejected, (state, action) => {
        state.status = SessionStatus.CHECKIN_IN_FAILED;
        state.error = action.payload as ErrorMessage[];
      })
      .addCase(sessionCheckin.fulfilled, (state, action) => {
        state.status = SessionStatus.CHECKIN_IN_SUCCEEDED;
        const sessionCheckedIn = action.payload;
        const session = findSession(state, sessionCheckedIn);
        updateAttendees(session, sessionCheckedIn);
        updateCredits(state.sessions, sessionCheckedIn);
      })
      .addCase(sessionCheckout.pending, (state, action) => {
        state.status = SessionStatus.CHECKOUT_IN_PROGRESS;
      })
      .addCase(sessionCheckout.rejected, (state, action) => {
        state.status = SessionStatus.CHECKOUT_FAILED;
        state.error = map_action_thunk_error(
          "Checkout",
          action.payload as ApiError
        );
      })
      .addCase(sessionCheckout.fulfilled, (state, action) => {
        state.status = SessionStatus.CHECKOUT_SUCCEEDED;
        const sessionCheckedOut = action.payload;
        const session = state.sessions.find(
          (session) => session.id === sessionCheckedOut.id
        );
        updateAttendees(session, sessionCheckedOut);
        updateCredits(state.sessions, sessionCheckedOut);
      })
      .addCase(sessionCancel.fulfilled, (state, action) => {
        state.status = SessionStatus.CANCEL_SUCCEEDED;
        const sessionCancelled = action.payload;
        const session = findSession(state, sessionCancelled);
        if (session) {
          session.attendees = sessionCancelled.attendees?.map((attendee) =>
            mapAttendee(attendee)
          );
          session.id = sessionCancelled.id;
        }
      });
  },
});

const mapAttendee = (apiAttendee: ApiAttendee | Attendee): Attendee => {
  return {
    id: apiAttendee.id,
    firstname: apiAttendee.firstname,
    lastname: apiAttendee.lastname,
    attendance: apiAttendee.attendance as Attendance,
    credits: { amount: apiAttendee.credits?.amount },
  };
};

const mapSession = (apiSession: ApiSession): Session => {
  return {
    id: apiSession.id,
    classroomId: apiSession.classroom_id,
    name: apiSession.name,
    subject: apiSession.subject as Subjects,
    schedule: {
      start: apiSession.schedule.start,
      stop: apiSession.schedule.stop,
    },
    position: apiSession.position,
    attendees: apiSession.attendees?.map((attendee) => mapAttendee(attendee)),
  };
};

export const selectMonthlySessions = (state: RootState) =>
  state.sessions.sessions;
export function findAttendeeById(
  result: Session,
  attendeeId: string
): Attendee | undefined {
  return result.attendees?.find((attendee) => attendee.id === attendeeId);
}
export default sessionsSlice.reducer;
