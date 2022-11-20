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

export type SessionDetailsState = {
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
      callback: (classroomId: string, attendees: Attendee[]) => void;
      type: SessionDetailsActionType.ADD_ATTENDEES;
    }
  | {
      attendeesOnError: Attendee[];
      displayErrorCallback: () => void;
      clients: Client[];
      onAttendeesAddedCallback: (attendees: Attendee[]) => void;
      type: SessionDetailsActionType.ADD_ATTENDEE_FAILED;
    };

export const sessionDetailsReducer = (
  state: SessionDetailsState,
  action: SessionDetailsAction
): SessionDetailsState => {
  switch (action.type) {
    case SessionDetailsActionType.ADD_ATTENDEE_FAILED: {
      action.displayErrorCallback();
      const newSession = {
        ...state.session,
        attendees: state.session.attendees?.filter(
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
        attendees: state.session.attendees?.concat(action.attendees),
      };
      action.callback(session.classroomId, session.attendees!);
      return {
        ...state,
        addAttendeeButtonDisabled:
          session.attendees?.length === session.position,
        session,
        form: undefined,
      };
    }
    case SessionDetailsActionType.ADD_ATTENDEE_FORM: {
      const attendees = action.clients.filter(
        (client) =>
          !state.session.attendees?.find(
            (attendee) => attendee.id === client.id
          )
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

export const initializeSessionDetailsReducer = (
  session: Session
): SessionDetailsState => {
  const addAttendeeButtonDisabled =
    session.attendees?.length === session.position;
  return {
    session,
    form: undefined,
    addAttendeeButtonDisabled,
  };
};
export const sessionCancelled = (session: Session): SessionDetailsAction => {
  return { session, type: SessionDetailsActionType.SESSION_CANCELLED };
};
export const addAttendeesForm = (
  clients: Client[],
  callback: (attendees: Attendee[]) => void
): SessionDetailsAction => {
  return {
    clients,
    callback,
    type: SessionDetailsActionType.ADD_ATTENDEE_FORM,
  };
};
export const addAttendees = (
  attendees: Attendee[],
  callback: (classroomId: string, attendees: Attendee[]) => void
): SessionDetailsAction => {
  return { attendees, callback, type: SessionDetailsActionType.ADD_ATTENDEES };
};
export const addAttendeesFailed = (
  attendeesOnError: Attendee[],
  displayErrorCallback: () => void,
  clients: Client[],
  onAttendeesAddedCallback: (attendees: Attendee[]) => void
): SessionDetailsAction => {
  return {
    attendeesOnError,
    displayErrorCallback,
    clients,
    onAttendeesAddedCallback,
    type: SessionDetailsActionType.ADD_ATTENDEE_FAILED,
  };
};

enum SessionAttendeeActionType {
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
}

type SessionAttendeeState = {
  attendee: Attendee;
  session: Session;
  attendeeLabelStatus: "R" | "C";
  attendeeLabelColor: "primary" | "success";
};

type SessionAttendeeAction =
  | {
      attendee: Attendee;
      type: SessionAttendeeActionType.CHECKED_IN;
    }
  | {
      attendee: Attendee;
      type: SessionAttendeeActionType.CHECKED_OUT;
    };

export const sessionAttendeeReducer = (
  state: SessionAttendeeState,
  action: SessionAttendeeAction
): SessionAttendeeState => {
  switch (action.type) {
    case SessionAttendeeActionType.CHECKED_OUT:
      return {
        ...state,
        attendee: action.attendee,
        attendeeLabelStatus: "R",
        attendeeLabelColor: "primary",
      };
    case SessionAttendeeActionType.CHECKED_IN:
      return {
        ...state,
        attendee: action.attendee,
        attendeeLabelStatus: "C",
        attendeeLabelColor: "success",
      };
  }
};
export const attendeeCheckedIn = (
  attendee: Attendee
): SessionAttendeeAction => {
  return {
    attendee,
    type: SessionAttendeeActionType.CHECKED_IN,
  };
};
export const attendeeCheckedOut = (
  attendee: Attendee
): SessionAttendeeAction => {
  return {
    attendee,
    type: SessionAttendeeActionType.CHECKED_OUT,
  };
};
