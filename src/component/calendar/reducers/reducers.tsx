import {
  Attendance,
  Attendee,
  Session,
} from "../../../features/domain/session";
import * as React from "react";
import { ReactElement, useState } from "react";
import { Client } from "../../../features/domain/client";
import { Button, Grid } from "@mui/material";
import { AttendeeSelector } from "../../scheduling/AttendeeSelector";

type SessionDetailsState = {
  session: Session;
  form: ReactElement | undefined;
  addAttendeeButtonDisabled: boolean;
};

enum SessionDetailsActionType {
  SESSION_CANCELLED = "SESSION_CANCELLED",
  ADD_ATTENDEE_FORM = "ADD_ATTENDEE_FORM",
  ADD_ATTENDEES = "ADD_ATTENDEES",
  ADD_ATTENDEE_FAILED = "ADD_ATTENDEE_FAILED",
}

const AddAttendeeForm = ({
  attendees,
  onAttendeesAdded,
}: {
  onAttendeesAdded: (selectedAttendees: Attendee[]) => void;
  attendees: Client[];
}) => {
  const [selectedAttendees, setSelectedAttendees] = useState<Client[]>([]);

  const onSubmitClicked = () => {
    onAttendeesAdded(
      selectedAttendees.map((client) => ({
        id: client.id,
        firstname: client.firstname,
        lastname: client.lastname,
        attendance: Attendance.REGISTERED,
      }))
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={12}>
        <AttendeeSelector
          clients={attendees}
          onChange={(attendees) => setSelectedAttendees(attendees)}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={12}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onSubmitClicked}>Submit</Button>
      </Grid>
    </Grid>
  );
};

type SessionDetailsAction =
  | {
      type: SessionDetailsActionType.SESSION_CANCELLED;
      session: Session;
    }
  | {
      clients: Client[];
      callback: (attendees: Attendee[]) => void;
      type: SessionDetailsActionType.ADD_ATTENDEE_FORM;
    }
  | {
      attendees: Attendee[];
      callback: (
        classroomId: string,
        session_date: string,
        attendees: Attendee[]
      ) => void;
      type: SessionDetailsActionType.ADD_ATTENDEES;
    }
  | {
      attendeesOnError: Attendee[];
      clients: Client[];
      onAttendeesAddedCallback: (attendees: Attendee[]) => void;
      type: SessionDetailsActionType.ADD_ATTENDEE_FAILED;
    };

const sessionDetailsReducer = (
  state: SessionDetailsState,
  action: SessionDetailsAction
): SessionDetailsState => {
  switch (action.type) {
    case SessionDetailsActionType.ADD_ATTENDEE_FAILED: {
      const newSession = {
        ...state.session,
        attendees: state.session.attendees.filter(
          (attendee) =>
            !action.attendeesOnError.find((onError) => onError === attendee)
        ),
      };
      return {
        ...state,
        session: newSession,
        addAttendeeButtonDisabled:
          newSession.attendees !== undefined &&
          newSession.attendees.length >= newSession.position,
        form: (
          <AddAttendeeForm
            attendees={action.clients}
            onAttendeesAdded={action.onAttendeesAddedCallback}
          />
        ),
      };
    }
    case SessionDetailsActionType.ADD_ATTENDEES: {
      const session = {
        ...state.session,
        attendees: state.session.attendees.concat(action.attendees),
      };
      action.callback(
        session.classroomId,
        session.schedule.start,
        session.attendees
      );
      return {
        ...state,
        addAttendeeButtonDisabled:
          session.attendees.length === session.position,
        session,
        form: undefined,
      };
    }
    case SessionDetailsActionType.ADD_ATTENDEE_FORM: {
      const attendees = action.clients.filter(
        (client) =>
          !state.session.attendees.find((attendee) => attendee.id === client.id)
      );
      return {
        ...state,
        addAttendeeButtonDisabled: true,
        form: (
          <AddAttendeeForm
            attendees={attendees}
            onAttendeesAdded={action.callback}
          />
        ),
      };
    }
    case SessionDetailsActionType.SESSION_CANCELLED:
      return { ...state, session: action.session };
  }
};

const initializeSessionDetailsReducer = (
  session: Session
): SessionDetailsState => {
  const addAttendeeButtonDisabled =
    session.attendees.length === session.position;
  return {
    session,
    form: undefined,
    addAttendeeButtonDisabled,
  };
};
const sessionCancelled = (session: Session): SessionDetailsAction => {
  return { session, type: SessionDetailsActionType.SESSION_CANCELLED };
};
const addAttendeesForm = (
  clients: Client[],
  callback: (attendees: Attendee[]) => void
): SessionDetailsAction => {
  return {
    clients,
    callback,
    type: SessionDetailsActionType.ADD_ATTENDEE_FORM,
  };
};
const addAttendees = (
  attendees: Attendee[],
  callback: (
    classroomId: string,
    session_date: string,
    attendees: Attendee[]
  ) => void
): SessionDetailsAction => {
  return { attendees, callback, type: SessionDetailsActionType.ADD_ATTENDEES };
};

const addAttendeesFailed = (
  attendeesOnError: Attendee[],
  clients: Client[],
  onAttendeesAddedCallback: (attendees: Attendee[]) => void
): SessionDetailsAction => {
  return {
    attendeesOnError,
    clients,
    onAttendeesAddedCallback,
    type: SessionDetailsActionType.ADD_ATTENDEE_FAILED,
  };
};

enum SessionAttendeeActionType {
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CHECK_IN = "CHECK_IN",
  CHECK_OUT = "CHECK_OUT",
  CANCEL_ATTENDEE = "CANCEL_ATTENDEE",
  CLOSE_OPTIONS = "CLOSE_OPTIONS",
  OPEN_OPTIONS = "OPEN_OPTIONS",
}

type SessionAttendeeState = {
  attendee: Attendee;
  session: Session;
  attendeeLabelStatus: "R" | "C";
  attendeeLabelColor: "primary" | "success";
  checkin: boolean;
  checkout: boolean;
  optionsAnchor: HTMLElement | null;
};

type SessionAttendeeAction =
  | {
      attendee: Attendee;
      type: SessionAttendeeActionType.CHECKED_IN;
    }
  | {
      attendee: Attendee;
      type: SessionAttendeeActionType.CHECKED_OUT;
    }
  | {
      type: SessionAttendeeActionType.CHECK_IN;
    }
  | {
      type: SessionAttendeeActionType.CHECK_OUT;
    }
  | {
      type: SessionAttendeeActionType.CANCEL_ATTENDEE;
    }
  | {
      type: SessionAttendeeActionType.CLOSE_OPTIONS;
    }
  | {
      anchorEl: HTMLElement;
      type: SessionAttendeeActionType.OPEN_OPTIONS;
    };

const sessionAttendeeReducer = (
  state: SessionAttendeeState,
  action: SessionAttendeeAction
): SessionAttendeeState => {
  switch (action.type) {
    case SessionAttendeeActionType.OPEN_OPTIONS:
      return {
        ...state,
        optionsAnchor: action.anchorEl,
      };
    case SessionAttendeeActionType.CLOSE_OPTIONS:
      return {
        ...state,
        optionsAnchor: null,
      };
    case SessionAttendeeActionType.CANCEL_ATTENDEE:
      return {
        ...state,
        optionsAnchor: null,
      };
    case SessionAttendeeActionType.CHECK_OUT:
      return {
        ...state,
        checkout: true,
      };
    case SessionAttendeeActionType.CHECK_IN:
      return {
        ...state,
        checkin: true,
      };
    case SessionAttendeeActionType.CHECKED_OUT:
      return {
        ...state,
        attendee: action.attendee,
        attendeeLabelStatus: "R",
        attendeeLabelColor: "primary",
        checkout: false,
      };
    case SessionAttendeeActionType.CHECKED_IN:
      return {
        ...state,
        attendee: action.attendee,
        attendeeLabelStatus: "C",
        attendeeLabelColor: "success",
        checkin: false,
      };
  }
};
const attendeeCheckedIn = (attendee: Attendee): SessionAttendeeAction => {
  return {
    attendee,
    type: SessionAttendeeActionType.CHECKED_IN,
  };
};
const attendeeCheckedOut = (attendee: Attendee): SessionAttendeeAction => {
  return {
    attendee,
    type: SessionAttendeeActionType.CHECKED_OUT,
  };
};

const attendeeCheckin = (): SessionAttendeeAction => {
  return {
    type: SessionAttendeeActionType.CHECK_IN,
  };
};

const attendeeCheckout = (): SessionAttendeeAction => {
  return {
    type: SessionAttendeeActionType.CHECK_OUT,
  };
};

const cancelAttendee = (): SessionAttendeeAction => {
  return {
    type: SessionAttendeeActionType.CANCEL_ATTENDEE,
  };
};

const closeOptions = (): SessionAttendeeAction => {
  return {
    type: SessionAttendeeActionType.CLOSE_OPTIONS,
  };
};

const openOptions = (element: HTMLElement): SessionAttendeeAction => {
  return {
    anchorEl: element,
    type: SessionAttendeeActionType.OPEN_OPTIONS,
  };
};

const initializeSessionAttendeeState = (
  attendee: Attendee,
  session: Session
): SessionAttendeeState => {
  return {
    attendee,
    attendeeLabelColor:
      attendee.attendance === Attendance.REGISTERED ? "primary" : "success",
    attendeeLabelStatus:
      attendee.attendance === Attendance.REGISTERED ? "R" : "C",
    session,
    checkin: false,
    checkout: false,
    optionsAnchor: null,
  };
};

export {
  sessionAttendeeReducer,
  sessionDetailsReducer,
  cancelAttendee,
  attendeeCheckout,
  attendeeCheckin,
  attendeeCheckedOut,
  attendeeCheckedIn,
  closeOptions,
  openOptions,
  initializeSessionAttendeeState,
  addAttendeesFailed,
  addAttendees,
  addAttendeesForm,
  sessionCancelled,
  initializeSessionDetailsReducer,
};

export type { SessionAttendeeState, SessionDetailsState };
