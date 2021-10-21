import {Button, Grid, InputLabel, MenuItem, Select} from "@mui/material";
import {FormControl, TextField} from "@material-ui/core";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
import * as React from "react";
import {useState} from "react";

export const AddClassroomForm = (date) => {

    const [classroomName, setClassroomName] = useState('')
    const [classroomStartDateTime, setClassroomStartDateTime] = useState(date.date)
    const [classroomEndDateTime, setClassroomEndDateTime] = useState(date.date)
    const [position, setPosition] = useState(1)
    const [duration, setDuration] = useState(60)

    const onClassroomNameChanged = (e) => setClassroomName(e.target.value)
    const onPositionChanged = (e) => setPosition(e.target.value);
    const onDurationChanged = (e) => setDuration(e.target.value)

    const dayStart = new Date(date.date.getFullYear(), date.date.getMonth(), date.date.getDate(), 0, 0, 0)
    const dayEnd = new Date(date.date.getFullYear(), date.date.getMonth(), date.date.getDate(), 23, 59, 59)

    return (
        <Grid container>
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
                            onChange={onPositionChanged}
                            size="small"
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                            <MenuItem value={4}>4</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container spacing={1} direction="row">
                <Grid item xs={12} md={6}>
                    <FormControl>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="Classroom start time"
                                value={classroomStartDateTime}
                                onChange={(newValue) => {
                                    setClassroomStartDateTime(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
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
                                label="Classroom end time"
                                value={classroomEndDateTime}
                                onChange={(newValue) => {
                                    setClassroomEndDateTime(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                                minDateTime={dayStart}
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
                            aria-labelledby="duration-select-label"
                        >
                            <MenuItem value={15}>0h15</MenuItem>
                            <MenuItem value={30}>0h30</MenuItem>
                            <MenuItem value={45}>0h45</MenuItem>
                            <MenuItem value={60}>1h00</MenuItem>
                            <MenuItem value={75}>1h15</MenuItem>
                            <MenuItem value={90}>1h30</MenuItem>
                            <MenuItem value={105}>1h45</MenuItem>
                            <MenuItem value={120}>2h00</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12} md={12} sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Button>Submit</Button>
                </Grid>
            </Grid>
        </Grid>
    )
}