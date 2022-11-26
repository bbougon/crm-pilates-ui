import * as React from "react";
import { BaseSyntheticEvent, useCallback, useEffect, useReducer } from "react";
import {
  addAttendeesToSession,
  findAttendeeById,
  sessionCancel,
  sessionCheckin,
  sessionCheckout,
} from "../../features/sessionsSlice";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { formatFullDate, formatHours } from "../../utils/date";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Attendee, Session } from "../../features/domain/session";
import { CreditBox } from "../CreditBox";
import { useAppDispatch } from "../../hooks/redux";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AddElementButton } from "../button/AddElementButton";
import { Client } from "../../features/domain/client";
import { useSelector } from "react-redux";
import { selectAllClients } from "../../features/clientsSlice";
import {
  addAttendees,
  addAttendeesFailed,
  addAttendeesForm,
  attendeeCheckedIn,
  attendeeCheckedOut,
  attendeeCheckin,
  attendeeCheckout,
  cancelAttendee,
  closeOptions,
  initializeSessionAttendeeState,
  initializeSessionDetailsReducer,
  openOptions,
  sessionAttendeeReducer,
  sessionCancelled,
  sessionDetailsReducer,
} from "./reducers/reducers";
import { useRefreshSessions } from "../../hooks/useRefreshSessions";

const theme = createTheme({
  components: {
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          height: 24,
        },
      },
    },
  },
});

interface SessionAttendeeProps {
  attendee: Attendee;
  session: Session;
  onCancel: (cancel: CancelAttendee) => void;
}

type CancelAttendee = {
  classroomId: string;
  start: string;
  attendeeId: string;
};

const SessionAttendee = (sessionAttendeeProps: SessionAttendeeProps) => {
  const { display } = useSnackbar();
  const dispatch = useAppDispatch();

  const [state, dispatchReducer] = useReducer(
    sessionAttendeeReducer,
    initializeSessionAttendeeState(
      sessionAttendeeProps.attendee,
      sessionAttendeeProps.session
    )
  );

  const options = ["Cancel"];

  useEffect(() => {
    if (state.checkin) {
      dispatch(
        sessionCheckin({
          attendeeId: state.attendee.id,
          start: state.session.schedule.start,
          classroomId: state.session.classroomId,
        })
      )
        .unwrap()
        .then((result) => {
          const attendee = findAttendeeById(result, state.attendee.id);
          if (attendee) {
            dispatchReducer(attendeeCheckedIn(attendee));
          }
        })
        .catch((err) => display(err, "error"));
    }
    if (state.checkout) {
      dispatch(
        sessionCheckout({
          attendeeId: state.attendee.id,
          sessionId: state.session.id!,
        })
      )
        .unwrap()
        .then((result) => {
          const attendee = findAttendeeById(result, state.attendee.id);
          if (attendee) {
            dispatchReducer(attendeeCheckedOut(attendee));
          }
        })
        .catch((err) => display(err, "error"));
    }
  }, [dispatch, state, display]);
  const handleAction = (_: React.MouseEvent<HTMLElement>) => {
    const cancel = {
      classroomId: state.session.classroomId,
      start: state.session.schedule.start,
      attendeeId: state.attendee.id,
    };
    sessionAttendeeProps.onCancel(cancel);
    dispatchReducer(cancelAttendee());
  };
  const onSessionCheckin = async (e: BaseSyntheticEvent) => {
    if (e.target.checked) {
      dispatchReducer(attendeeCheckin());
    } else {
      dispatchReducer(attendeeCheckout());
    }
  };

  return (
    <Grid container direction="row">
      <Grid
        item
        xs={8}
        md={8}
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid
          container
          direction="row"
          sx={{
            display: "flex",
          }}
        >
          <Grid item xs={8} md={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Typography variant="body1">
                {state.attendee.firstname
                  .concat(" ")
                  .concat(state.attendee.lastname)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4} md={4}>
            <CreditBox credit={state.attendee.credits?.amount || 0} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={4} md={4}>
        <Grid container direction="row">
          <Grid
            item
            xs={6}
            md={6}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <ThemeProvider theme={theme}>
              <Switch
                size="small"
                checked={state.attendee.attendance === "CHECKED_IN"}
                color={state.attendeeLabelColor}
                onChange={onSessionCheckin}
              />
            </ThemeProvider>
          </Grid>
          <Grid
            item
            xs={3}
            md={3}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <ThemeProvider theme={theme}>
              <Chip
                size="small"
                label={state.attendeeLabelStatus}
                color={state.attendeeLabelColor}
              />
            </ThemeProvider>
          </Grid>
          <Grid
            item
            xs={3}
            md={3}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="more"
              id="actions-button"
              aria-controls="attendee-actions"
              aria-expanded={state.optionsAnchor ? "true" : undefined}
              aria-haspopup="true"
              onClick={(e) => dispatchReducer(openOptions(e.currentTarget))}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="attendee-actions"
              MenuListProps={{
                "aria-labelledby": "actions-button",
              }}
              anchorEl={state.optionsAnchor}
              open={Boolean(state.optionsAnchor)}
              onClose={() => dispatchReducer(closeOptions())}
              PaperProps={{
                style: {
                  width: "20ch",
                },
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={option}
                  onClick={(event) => handleAction(event)}
                  disabled={state.attendee.attendance === "CHECKED_IN"}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const SessionAttendees = ({
  session,
  onCancel,
}: {
  session: Session;
  onCancel: (cancel: CancelAttendee) => void;
}) => {
  const content = session.attendees.map((attendee) => (
    <SessionAttendee
      key={attendee.id}
      attendee={attendee}
      session={session}
      onCancel={onCancel}
    />
  ));
  return <Grid container>{content}</Grid>;
};

export const SessionDetails = ({ session }: { session: Session }) => {
  const [state, dispatchReducer] = useReducer(
    sessionDetailsReducer,
    initializeSessionDetailsReducer(session)
  );
  const clients: Client[] = useSelector(selectAllClients);

  const dispatch = useAppDispatch();
  const { display } = useSnackbar();
  const { refresh } = useRefreshSessions();
  const errorCallback = useCallback((error) => {
    display(error, "error");
  }, []);

  const dateSubheader = formatFullDate(state.session.schedule.start)
    .concat(` ${formatHours(state.session.schedule.start)}`)
    .concat(" to ")
    .concat(formatFullDate(state.session.schedule.stop))
    .concat(` ${formatHours(state.session.schedule.stop)}`);

  const cancelSession = useCallback(
    (cancel: CancelAttendee) => {
      dispatch(sessionCancel(cancel))
        .unwrap()
        .then((session) => {
          dispatchReducer(sessionCancelled(session));
        })
        .catch((err) => display(err, "error"));
    },
    [dispatch, display, dispatchReducer]
  );

  const onAttendeesAdded = useCallback(
    (attendees: Attendee[]) => {
      dispatchReducer(
        addAttendees(
          attendees,
          (
            classroomId: string,
            session_date: string,
            attendeesToAdd: Attendee[]
          ) =>
            dispatch(
              addAttendeesToSession({
                classroomId: classroomId,
                session_date: session_date,
                attendees: attendeesToAdd,
              })
            )
              .unwrap()
              .then(() => refresh())
              .catch((err) => {
                dispatchReducer(
                  addAttendeesFailed(attendees, clients, onAttendeesAdded)
                );
                errorCallback(err);
              })
        )
      );
    },
    [dispatch, refresh, clients, display]
  );

  return (
    <Card sx={{ width: 1 }}>
      <CardHeader
        title={state.session.name}
        subheader={dateSubheader}
        component="div"
      />
      <CardContent>
        <SessionAttendees session={state.session} onCancel={cancelSession} />
        {state.form}
        <AddElementButton
          onAddElementButton={() =>
            dispatchReducer(addAttendeesForm(clients, onAttendeesAdded))
          }
          disabled={state.addAttendeeButtonDisabled}
        />
      </CardContent>
    </Card>
  );
};
