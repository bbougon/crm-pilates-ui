import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    InputLabel,
    MenuItem,
    Select, SelectChangeEvent,
    TextField
} from "@mui/material";
import {FormControl} from "@material-ui/core";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import * as React from "react";
import {BaseSyntheticEvent, useReducer} from "react";
import set from "date-fns/set";
import {useDispatch, useSelector} from "react-redux";
import {selectAllClients} from "../../features/clientsSlice";
import {addClassroom} from "../../features/classroomSlice";
import {format, formatISO, isValid} from "date-fns";
import {Subjects} from "../../features/domain/subjects";
import {Attendee, Classroom} from "../../features/domain/classroom";
import {Client} from "../../features/domain/client";
import {subjects} from "../../utils/translation";

type AddClassroomFormProps = {
    date: Date
    onClassroomAdded: () => void
}

enum ActionType {
    CLASSROOM_NAME_CHANGED = "CLASSROOM_NAME_CHANGED",
    SUBJECT_CHANGED = "SUBJECT_CHANGED",
    POSITION_CHANGED = "POSITION_CHANGED",
    DURATION_UPDATED = "DURATION_UPDATED",
    ATTENDEES_UPDATED = "ATTENDEES_UPDATED",
    START_DATE_UPDATED = "START_DATE_UPDATED",
    END_DATE_UPDATED = "END_DATE_UPDATED",
}

type State = {
    currentDate: Date
    classroomName: string
    position: number
    subject?: Subjects | unknown
    duration: number
    classroomStartDateTime: string
    classroomEndDateTime: string
    attendees: Attendee[]
    availableDurations: { duration: number, human: string }[]
    availablePositions: number[]
    fieldsAreFilled: (state: State) => boolean
}

type Action =
    | {
    type: ActionType.CLASSROOM_NAME_CHANGED
    classroomName: string
}
    | {
    type: ActionType.SUBJECT_CHANGED
    subject: Subjects
} | {
    type: ActionType.POSITION_CHANGED
    position: number
}
    | {
    type: ActionType.DURATION_UPDATED
    duration: number
}
    | {
    type: ActionType.ATTENDEES_UPDATED
    attendees: Client[]
}
    | {
    type: ActionType.START_DATE_UPDATED
    startDate: Date
}
    | {
    type: ActionType.END_DATE_UPDATED
    endDate: Date
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.CLASSROOM_NAME_CHANGED:
            return {...state, classroomName: action.classroomName}
        case ActionType.SUBJECT_CHANGED:
            return {...state, subject: action.subject}
        case ActionType.POSITION_CHANGED:
            return {...state, position: action.position}
        case ActionType.DURATION_UPDATED:
            return {...state, duration: action.duration}
        case ActionType.ATTENDEES_UPDATED:
            return {
                ...state,
                attendees: action.attendees.map(attendee => ({id: attendee.id})),
                position: action.attendees.length > state.position ? action.attendees.length : state.position
            }
        case ActionType.START_DATE_UPDATED:
            return {...state, classroomStartDateTime: formatISO(action.startDate)}
        case ActionType.END_DATE_UPDATED:
            return {...state, classroomEndDateTime: formatISO(action.endDate)}
    }
}

function updateClasrroomName(classroomName: string): Action {
    return {classroomName, type: ActionType.CLASSROOM_NAME_CHANGED}
}

function updateSubject(subject: Subjects): Action {
    return {subject, type: ActionType.SUBJECT_CHANGED}
}

function updatePosition(position: number): Action {
    return {position, type: ActionType.POSITION_CHANGED}
}

function updateDuration(duration: number): Action {
    return {duration, type: ActionType.DURATION_UPDATED}
}

function updateAttendees(attendees: Client[]): Action {
    return {attendees, type: ActionType.ATTENDEES_UPDATED}
}

function updateClassroomStartDate(startDate: Date): Action {
    return {startDate, type: ActionType.START_DATE_UPDATED}
}

function updateClassroomEndDate(endDate: Date): Action {
    return {endDate, type: ActionType.END_DATE_UPDATED}
}

const FORMAT = "MM/dd/yyyy HH:mm"
export const AddClassroomForm = ({date, onClassroomAdded}: AddClassroomFormProps) => {

    const dispatch = useDispatch();

    const [state, dispatchReducer] = useReducer(reducer, {
        classroomName: "",
        currentDate: new Date(),
        classroomStartDateTime: formatISO(set(date, {hours: date.getHours(), minutes: date.getMinutes()})),
        classroomEndDateTime: formatISO(set(date, {hours: date.getHours() + 1, minutes: date.getMinutes()})),
        duration: 60,
        position: 1,
        attendees: [],
        availableDurations: [
            {duration: 15, human: "0h15"},
            {duration: 30, human: "Oh30"},
            {duration: 45, human: "0h45"},
            {duration: 60, human: "1h00"},
            {duration: 75, human: "1h15"},
            {duration: 90, human: "1h30"},
            {duration: 105, human: "1h45"},
            {duration: 120, human: "2h00"}
        ],
        availablePositions: [1, 2, 3, 4, 5, 6],
        fieldsAreFilled: (state: State) => {
            return state.classroomName !== ""
                && state.subject !== undefined
                && state.availableDurations.map(duration => duration.duration).includes(state.duration)
        }
    })

    const clients: Client[] = useSelector(selectAllClients)

    const onClassroomNameChanged = (e: BaseSyntheticEvent) => dispatchReducer(updateClasrroomName(e.target.value))
    const onSubjectChanged = (e: SelectChangeEvent<Subjects | unknown>) => dispatchReducer(updateSubject(e.target.value as Subjects))
    const onPositionChanged = (e: SelectChangeEvent<number>) => dispatchReducer(updatePosition(e.target.value as number))
    const onDurationChanged = (e: SelectChangeEvent<number>) => dispatchReducer(updateDuration(e.target.value as number))

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    const onSubmitClicked = async () => {
        const classroom: Classroom = {
            classroomName: state.classroomName,
            subject: state.subject as Subjects,
            startDate: state.classroomStartDateTime,
            endDate: state.classroomEndDateTime,
            position: state.position,
            duration: state.duration,
            attendees: state.attendees
        }
        await dispatch(addClassroom(classroom))
        onClassroomAdded()
    }

    return (
        <Card sx={{width: 1}}>
            <CardHeader title={`Add a classroom on ${format(date, "yyyy-MM-dd")}`} component="div"/>
            <CardContent>
                <Grid container rowSpacing={2}>
                    <Grid container spacing={1} direction="row">
                        <Grid item xs={12} md={6}>
                            <FormControl>
                                <TextField id="classroom-name" className="sizeSmall"
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
                                    {subjects.map(subject => <MenuItem key={subject.subject}
                                                                       value={subject.subject}>{subject.title}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="position-select-label">Position</InputLabel>
                                <Select
                                    labelId="position-select-label"
                                    id="position-select"
                                    value={state.position}
                                    label="Position"
                                    variant="standard"
                                    onChange={onPositionChanged}
                                    size="small"
                                >
                                    {state.availablePositions.map(position => <MenuItem key={position}
                                                                                   value={position}>{position}</MenuItem>)}
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
                                        onChange={(newValue) => {
                                            if (newValue !== null && isValid(newValue))
                                                dispatchReducer(updateClassroomStartDate(newValue))
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Choose start date"
                                                                            helperText="Choose start date"
                                                                            variant="standard"/>}
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
                                        onChange={(newValue) => {
                                            if (newValue !== null && isValid(newValue))
                                                dispatchReducer(updateClassroomEndDate(newValue));
                                        }}
                                        minDateTime={dayStart}
                                        value={state.classroomEndDateTime}
                                        renderInput={(props) => <TextField  {...props} variant="standard"/>}
                                        inputFormat={FORMAT}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="duration-select-label" htmlFor="duration-form">Duration</InputLabel>
                                <Select
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
                                    {state.availableDurations.map(duration => <MenuItem key={duration.duration}
                                                                                   value={duration.duration}>{duration.human}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} direction="row">
                        <Grid item xs={12} md={12}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    multiple
                                    id="attendees"
                                    options={clients}
                                    getOptionLabel={(option) => `${option.lastname} ${option.firstname}`}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            label="Attendees"
                                            placeholder="Attendees"
                                        />
                                    )}
                                    onChange={(event, value) => {
                                        dispatchReducer(updateAttendees(value))
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={12} sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Button onClick={onSubmitClicked} disabled={!state.fieldsAreFilled(state)}>Submit</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}