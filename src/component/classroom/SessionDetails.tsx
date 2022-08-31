import * as React from "react";
import {BaseSyntheticEvent, useReducer} from "react";
import {useDispatch} from "react-redux";
import {sessionCancel, sessionCheckin, sessionCheckout} from "../../features/sessionsSlice";
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
    Typography
} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {formatFullDate, formatHours} from "../../utils/date";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Attendance, Attendee, Session} from "../../features/domain/session";
import {CreditBox} from "../CreditBox";

const theme = createTheme({
    components: {
        MuiChip: {
            styleOverrides: {
                sizeSmall: {
                    height: 24
                }
            }
        }
    },
});

interface SessionAttendeeProps {
    attendee: Attendee
    session: Session
}

enum ActionType {
    CHECKED_IN = "CHECKED_IN"

}

type State = {
    attendee: Attendee
    session: Session
    attendeeLabelStatus: 'R' | 'C'
    attendeeLabelColor: 'primary' | 'success'
}

type Action =
    | {
    type: ActionType.CHECKED_IN
}

function reducer(state: State, action:Action): State {
    switch (action.type) {
        case ActionType.CHECKED_IN:
            return {...state, attendeeLabelStatus: "C", attendeeLabelColor: "success"}
    }
}

const attendeeCheckedIn = (): Action => {
    return {type: ActionType.CHECKED_IN}
}

const SessionAttendee = (sessionAttendeeProps: SessionAttendeeProps) => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [state, dispatchReducer] = useReducer(reducer, {
        attendee: sessionAttendeeProps.attendee,
        attendeeLabelColor: sessionAttendeeProps.attendee.attendance === Attendance.REGISTERED ? 'primary' : 'success',
        attendeeLabelStatus: sessionAttendeeProps.attendee.attendance === Attendance.REGISTERED ? 'R' : 'C',
        session: sessionAttendeeProps.session
    })

    const options = [
        'Cancel',
    ]

    const dispatch = useDispatch();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (_: React.MouseEvent<HTMLElement>) => {
        const cancel = {
            classroomId: state.session.classroomId,
            start: state.session.schedule.start,
            attendeeId: state.attendee.id
        }
        dispatch(sessionCancel(cancel))
        setAnchorEl(null);
    };

    const onSessionCheckin = async (e: BaseSyntheticEvent) => {
        if (e.target.checked) {
            const checkin = {
                classroomId: state.session.classroomId,
                start: state.session.schedule.start,
                attendeeId: state.attendee.id
            }
            await dispatch(sessionCheckin(checkin))
            dispatchReducer(attendeeCheckedIn())
        } else {
            const checkout = {
                sessionId: state.session.id || "",
                attendeeId: state.attendee.id,
            }
            dispatch(sessionCheckout(checkout))
        }
    }

    return (
        <Grid container direction="row">
            <Grid item xs={8} md={8} sx={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <Grid container direction="row" sx={{
                    display: 'flex'
                }}>
                    <Grid item xs={8} md={8}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body1">
                                {state.attendee.firstname.concat(" ").concat(state.attendee.lastname)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4} md={4}>
                        <CreditBox credit={state.attendee.credits?.amount || 0}/>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} md={4}>
                <Grid container direction="row">
                    <Grid item xs={6} md={6} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <ThemeProvider theme={theme}>
                            <Switch size="small" defaultChecked={state.attendee.attendance === "CHECKED_IN"}
                                    color={state.attendeeLabelColor} onChange={onSessionCheckin}/>
                        </ThemeProvider>
                    </Grid>
                    <Grid item xs={3} md={3} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <ThemeProvider theme={theme}>
                            <Chip size="small" label={state.attendeeLabelStatus} color={state.attendeeLabelColor}/>
                        </ThemeProvider>
                    </Grid>
                    <Grid item xs={3} md={3} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <IconButton
                            aria-label="more"
                            id="actions-button"
                            aria-controls="attendee-actions"
                            aria-expanded={open ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleClick}
                            size="small"
                        >
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            id="attendee-actions"
                            MenuListProps={{
                                'aria-labelledby': 'actions-button',
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    width: '20ch',
                                },
                            }}
                        >
                            {options.map((option) => (
                                <MenuItem key={option} onClick={(event) => handleAction(event)}
                                          disabled={state.attendee.attendance === "CHECKED_IN"}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Grid>

                </Grid>
            </Grid>
        </Grid>
    )
}

const SessionAttendees = (session: Session) => {

    const content = session?.attendees?.map((attendee) => (
        <SessionAttendee key={attendee.id} attendee={attendee} session={session}/>))
    return (
        <Grid container>
            {content}
        </Grid>
    )
}

export const SessionDetails = ({session}: { session: Session }) => {

    const sessionStart = session.schedule.start;
    const sessionEnd = session.schedule.stop;
    const dateSubheader = formatFullDate(sessionStart)
        .concat(` ${formatHours(sessionStart)}`)
        .concat(" to ")
        .concat(formatFullDate(sessionEnd))
        .concat(` ${formatHours(sessionEnd)}`);
    return (
        <Card sx={{width: 1}}>
            <CardHeader title={session.name}
                        subheader={dateSubheader}
                        component="div"/>
            <CardContent>
                <SessionAttendees {...session}/>
            </CardContent>
        </Card>
    )
}