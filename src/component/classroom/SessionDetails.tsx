import * as React from "react";
import {BaseSyntheticEvent, useCallback, useEffect, useReducer, useState} from "react";
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
import {useAppDispatch} from "../../hooks/redux";
import {ApiAttendee, ApiSession} from "../../api";
import {Subjects} from "../../features/domain/subjects";

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

type CancelAttendee = {
    classroomId: string,
    start: string,
    attendeeId: string
}

interface SessionAttendeeProps {
    attendee: Attendee
    session: Session
    onCancel: (cancel: CancelAttendee) => void
}

enum ActionType {
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",

}

type State = {
    attendee: Attendee
    session: Session
    attendeeLabelStatus: 'R' | 'C'
    attendeeLabelColor: 'primary' | 'success'
}

type Action =
    | {
    attendee: Attendee
    type: ActionType.CHECKED_IN
}
    | {
    attendee: Attendee
    type: ActionType.CHECKED_OUT
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case ActionType.CHECKED_OUT:
            return {...state, attendee: action.attendee, attendeeLabelStatus: "R", attendeeLabelColor: "primary"};
        case ActionType.CHECKED_IN:
            return {...state, attendee: action.attendee, attendeeLabelStatus: "C", attendeeLabelColor: "success"}

    }
}

const attendeeCheckedIn = (attendee: Attendee): Action => {
    return {
        attendee,
        type: ActionType.CHECKED_IN
    }
}

const attendeeCheckedOut = (attendee: Attendee): Action => {
    return {
        attendee,
        type: ActionType.CHECKED_OUT
    }
}

const mapAttendee = (apiAttendee: ApiAttendee): Attendee => {
    return {
        id: apiAttendee.id,
        firstname: apiAttendee.firstname,
        lastname: apiAttendee.lastname,
        attendance: apiAttendee.attendance as Attendance,
        credits: {amount: apiAttendee.credits?.amount}
    }
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

    const [checkin, setCheckin] = useState<null | {
        classroomId: string,
        start: string,
        attendeeId: string
    }>(null)

    const [checkout, setCheckOut] = useState<null | {
        sessionId: string,
        attendeeId: string
    }>(null)

    const options = [
        'Cancel',
    ]

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (checkin) {
            dispatch(sessionCheckin(checkin)).then((result) => {
                const apiSession = result.payload as ApiSession;
                const apiAttendee = apiSession.attendees?.find(attendee => attendee.id === state.attendee.id)
                if (apiAttendee) {
                    dispatchReducer(attendeeCheckedIn(mapAttendee(apiAttendee)))
                }
            })
            setCheckin(null)
        }
        if (checkout) {
            dispatch(sessionCheckout(checkout)).then((result) => {
                const apiSession = result.payload as ApiSession;
                const apiAttendee = apiSession.attendees?.find(attendee => attendee.id === state.attendee.id)
                if (apiAttendee) {
                    dispatchReducer(attendeeCheckedOut(mapAttendee(apiAttendee)))
                }
            })
            setCheckOut(null)
        }
    }, [dispatch, checkin, checkout, state])

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
        sessionAttendeeProps.onCancel(cancel)
        setAnchorEl(null);
    };
    const onSessionCheckin = async (e: BaseSyntheticEvent) => {
        if (e.target.checked) {
            const checkin = {
                classroomId: state.session.classroomId,
                start: state.session.schedule.start,
                attendeeId: state.attendee.id
            }
            setCheckin(checkin)
        } else {
            const checkout = {
                sessionId: state.session.id || "",
                attendeeId: state.attendee.id,
            }
            setCheckOut(checkout)
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
                            <Switch size="small" checked={state.attendee.attendance === "CHECKED_IN"}
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

const SessionAttendees = ({session, onCancel}: { session: Session, onCancel: (cancel: CancelAttendee) => void }) => {

    const content = session?.attendees?.map((attendee) => (
        <SessionAttendee key={attendee.id} attendee={attendee} session={session} onCancel={onCancel}/>))
    return (
        <Grid container>
            {content}
        </Grid>
    )
}

const mapSession = (apiSession: ApiSession): Session => {
    return {
        id: apiSession.id,
        classroomId: apiSession.classroom_id,
        name: apiSession.name,
        subject: apiSession.subject as Subjects,
        schedule: {
            start: apiSession.schedule.start,
            stop: apiSession.schedule.stop
        },
        position: apiSession.position,
        attendees: apiSession.attendees?.map(attendee => mapAttendee(attendee))
    }
}

export const SessionDetails = ({session}: { session: Session }) => {

    const [mySession, setSession] = useState<Session>(session)
    const dispatch = useAppDispatch();

    const sessionStart = mySession.schedule.start;
    const sessionEnd = mySession.schedule.stop;
    const dateSubheader = formatFullDate(sessionStart)
        .concat(` ${formatHours(sessionStart)}`)
        .concat(" to ")
        .concat(formatFullDate(sessionEnd))
        .concat(` ${formatHours(sessionEnd)}`);

    const cancelSession = useCallback((cancel: CancelAttendee) => {
        dispatch(sessionCancel(cancel)).then((result) => {
            setSession(mapSession((result.payload as ApiSession)))
        })
    }, [dispatch])

    return (
        <Card sx={{width: 1}}>
            <CardHeader title={mySession.name}
                        subheader={dateSubheader}
                        component="div"/>
            <CardContent>
                <SessionAttendees session={mySession} onCancel={cancelSession}/>
            </CardContent>
        </Card>
    )
}