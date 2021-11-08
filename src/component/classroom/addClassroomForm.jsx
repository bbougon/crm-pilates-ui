import {Autocomplete, Button, Grid, InputLabel, MenuItem, Select} from "@mui/material";
import {FormControl, TextField} from "@material-ui/core";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import * as React from "react";
import {useState} from "react";
import set from "date-fns/set";
import {useDispatch, useSelector} from "react-redux";
import {selectAllClients} from "../../features/clientsSlice";
import {addClassroom} from "../../features/classroomSlice";
import {fetchSessions} from "../../features/sessionsSlice";

export const AddClassroomForm = ({date}) => {

    const dispatch = useDispatch();

    const available_durations = [
        {duration: 15, human: "0h15"},
        {duration: 30, human: "Oh30"},
        {duration: 45, human: "0h45"},
        {duration: 60, human: "1h00"},
        {duration: 75, human: "1h15"},
        {duration: 90, human: "1h30"},
        {duration: 105, human: "1h45"},
        {duration: 120, human: "2h00"}];

    const available_positions = [1, 2, 3, 4, 5, 6]

    const [currentDate] = useState(new Date())
    const [classroomName, setClassroomName] = useState('')
    const [position, setPosition] = useState(1)
    const [duration, setDuration] = useState(60)
    const [classroomStartDateTime, setClassroomStartDateTime] = useState(set(date, {
        hours: currentDate.getHours(),
        minutes: currentDate.getMinutes()
    }))
    const [classroomEndDateTime, setClassroomEndDateTime] = useState(null)
    const [attendees, setAttendees] = useState([])
    const clients = useSelector(selectAllClients)
    const link = useSelector((state => state.sessions.link))

    const onClassroomNameChanged = (e) => setClassroomName(e.target.value)
    const onPositionChanged = (e) => setPosition(e.target.value)
    const onDurationChanged = (e) => setDuration(e.target.value)

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    const fieldsAreNotFilled = () => {
        return classroomName === ""
            || position === null || position < 1
            || !(available_durations.map(duration => duration.duration).includes(duration))
    }

    const onSubmitClicked = async () => {
        const classroom = {classroomName, classroomStartDateTime, classroomEndDateTime, position, duration, attendees}
        await dispatch(addClassroom(classroom))
        await dispatch(fetchSessions(link.current.url))
    }

    return (
        <Grid container rowSpacing={2}>
            <Grid container spacing={1} direction="row">
                <Grid item xs={12} md={6}>
                    <FormControl>
                        <TextField id="classroom-name" className="sizeSmall"
                                   label="Classroom's name"
                                   helperText="Provide a classroom's name"
                                   required
                                   onChange={onClassroomNameChanged}
                                   aria-describedby="classroom-name-help"
                                   value={classroomName}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                        <InputLabel id="position-select-label">Position</InputLabel>
                        <Select
                            labelId="position-select-label"
                            id="position-select"
                            value={position}
                            label="Position"
                            variant="standard"
                            onChange={onPositionChanged}
                            size="small"
                        >
                            {available_positions.map(position => <MenuItem key={position}
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
                                    setClassroomStartDateTime(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} label="Choose start date" helperText="Choose start date" />}
                                value={classroomStartDateTime}
                                minDateTime={dayStart}
                                maxDateTime={dayEnd}
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
                                    setClassroomEndDateTime(newValue);
                                }}
                                renderInput={(params) => <TextField  {...params}
                                                                     helperText="Choose a date for recurrence"/>}
                                minDateTime={dayStart}
                                value={classroomEndDateTime}
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
                            value={duration}
                            label="Duration"
                            onChange={onDurationChanged}
                            size="small"
                            variant="standard"
                            aria-labelledby="duration-select-label"
                        >
                            {available_durations.map(duration => <MenuItem key={duration.duration}
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
                                setAttendees(value)
                                if (value.length > position)
                                    setPosition(value.length)
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
                    <Button onClick={onSubmitClicked} disabled={fieldsAreNotFilled()}>Submit</Button>
                </Grid>
            </Grid>
        </Grid>
    )
}