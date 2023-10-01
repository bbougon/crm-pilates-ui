import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import * as React from "react";
import { BaseSyntheticEvent, useReducer } from "react";
import set from "date-fns/set";
import { useSelector } from "react-redux";
import { selectAllClients } from "../../features/clientsSlice";
import { addClassroom } from "../../features/classroomSlice";
import { formatISO, intlFormat, isValid } from "date-fns";
import { Subjects } from "../../features/domain/subjects";
import { Classroom } from "../../features/domain/classroom";
import { Client } from "../../features/domain/client";
import { subjects } from "../../utils/translation";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import {
  SchedulingState,
  schedulingReducer,
  updateAttendees,
  updateClassroomEndDate,
  updateClassroomName,
  updateClassroomStartDate,
  updateDuration,
  updatePosition,
  updateSubject,
} from "./reducers";
import { useAppDispatch } from "../../hooks/redux";
import { useSnackbar } from "../../hooks/useSnackbar";
import { AttendeeSelector } from "./AttendeeSelector";
import { useRefreshSessions } from "../../hooks/useRefreshSessions";

const FORMAT = "MM/dd/yyyy HH:mm";

export const ClassroomScheduling = ({ date }: { date: Date }) => {
  const dispatch = useAppDispatch();
  const { display } = useSnackbar();
  const { refresh } = useRefreshSessions();

  const [state, dispatchReducer] = useReducer(schedulingReducer, {
    classroomName: "",
    classroomStartDateTime: formatISO(
      set(date, { hours: date.getHours(), minutes: date.getMinutes() })
    ),
    classroomEndDateTime: formatISO(
      set(date, { hours: date.getHours() + 1, minutes: date.getMinutes() })
    ),
    duration: 60,
    position: 1,
    attendees: [],
    availableDurations: [
      { duration: 15, human: "0h15" },
      { duration: 30, human: "Oh30" },
      { duration: 45, human: "0h45" },
      { duration: 60, human: "1h00" },
      { duration: 75, human: "1h15" },
      { duration: 90, human: "1h30" },
      { duration: 105, human: "1h45" },
      { duration: 120, human: "2h00" },
    ],
    availablePositions: [1, 2, 3, 4, 5, 6, 7, 8],
    fieldsAreFilled: (state: SchedulingState) => {
      return (
        state.classroomName !== "" &&
        state.subject !== undefined &&
        state.availableDurations
          .map((duration) => duration.duration)
          .includes(state.duration)
      );
    },
  });

  const clients: Client[] = useSelector(selectAllClients);

  const onClassroomNameChanged = (e: BaseSyntheticEvent) =>
    dispatchReducer(updateClassroomName(e.target.value));
  const onSubjectChanged = (e: SelectChangeEvent<Subjects | unknown>) =>
    dispatchReducer(updateSubject(e.target.value as Subjects));
  const onPositionChanged = (e: SelectChangeEvent<number>) =>
    dispatchReducer(updatePosition(e.target.value as number));
  const onDurationChanged = (e: SelectChangeEvent<number>) =>
    dispatchReducer(updateDuration(e.target.value as number));

  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0
  );
  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59
  );
  const onSubmitClicked = async () => {
    const classroom: Classroom = {
      classroomName: state.classroomName,
      subject: state.subject as Subjects,
      startDate: state.classroomStartDateTime,
      endDate: state.classroomEndDateTime,
      position: state.position,
      duration: state.duration,
      attendees: state.attendees,
    };
    dispatch(addClassroom(classroom))
      .unwrap()
      .then(() => refresh())
      .catch((err) => display(err, "error"));
  };

  return (
    <Card sx={{ width: 1 }}>
      <CardHeader
        title={`Scheduling classroom on ${intlFormat(date, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        component="div"
      />
      <CardContent>
        <Grid container rowSpacing={2}>
          <Grid container spacing={1} direction="row">
            <Grid item xs={12} md={6}>
              <FormControl>
                <TextField
                  id="classroom-name"
                  className="sizeSmall"
                  label="Classroom's name"
                  helperText="Provide a classroom's name"
                  required
                  variant="standard"
                  onChange={onClassroomNameChanged}
                  aria-describedby="classroom-name-help"
                  value={state.classroomName}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="subject-select-label">Subject</InputLabel>
                <Select
                  MenuProps={{ disablePortal: true }}
                  labelId="subject-select-label"
                  id="subject-select"
                  value={state.subject || ""}
                  required
                  placeholder="Select a subject"
                  label="Subject"
                  variant="standard"
                  onChange={onSubjectChanged}
                  size="small"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subject} value={subject.subject}>
                      {subject.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel id="position-select-label">Position</InputLabel>
                <Select
                  MenuProps={{ disablePortal: true }}
                  labelId="position-select-label"
                  id="position-select"
                  value={state.position}
                  label="Position"
                  variant="standard"
                  onChange={onPositionChanged}
                  size="small"
                >
                  {state.availablePositions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={1} direction="row">
            <Grid item xs={12} md={6}>
              <FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Choose start date"
                    minutesStep={5}
                    onChange={(newValue) => {
                      if (newValue !== null && isValid(newValue))
                        dispatchReducer(
                          updateClassroomStartDate(newValue as Date)
                        );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        aria-labelledby="Choose start date"
                        variant="standard"
                      />
                    )}
                    value={state.classroomStartDateTime}
                    minDateTime={dayStart}
                    maxDateTime={dayEnd}
                    inputFormat={FORMAT}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Recurrence"
                    minutesStep={5}
                    onChange={(newValue) => {
                      if (newValue !== null && isValid(newValue))
                        dispatchReducer(
                          updateClassroomEndDate(newValue as Date)
                        );
                    }}
                    minDateTime={dayStart}
                    value={state.classroomEndDateTime}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        variant="standard"
                        aria-labelledby="Recurrence"
                      />
                    )}
                    inputFormat={FORMAT}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="duration-select-label" htmlFor="duration-form">
                  Duration
                </InputLabel>
                <Select
                  MenuProps={{ disablePortal: true }}
                  labelId="duration-select-label"
                  id="duration-select"
                  name="duration-form"
                  value={state.duration}
                  label="Duration"
                  onChange={onDurationChanged}
                  size="small"
                  variant="standard"
                  aria-labelledby="duration-select-label"
                >
                  {state.availableDurations.map((duration) => (
                    <MenuItem key={duration.duration} value={duration.duration}>
                      {duration.human}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={1} direction="row">
            <Grid item xs={12} md={12}>
              <AttendeeSelector
                clients={clients}
                onChange={(attendees) =>
                  dispatchReducer(updateAttendees(attendees))
                }
              />
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={onSubmitClicked}
                disabled={!state.fieldsAreFilled(state)}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
