import * as React from "react";
import {useState} from "react";
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

const SessionAttendee = (sessionAttendeeProps: SessionAttendeeProps) => {

    const [attendee] = useState(sessionAttendeeProps.attendee);
    const [session] = useState(sessionAttendeeProps.session);
    const [attendeeLabelStatus] = useState(attendee.attendance === Attendance.REGISTERED ? 'R' : 'C')
    const [attendeeLabelColor] = useState<'primary' | 'success'>(attendee.attendance === Attendance.REGISTERED ? 'primary' : 'success')
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

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

    const handleAction = (event: React.MouseEvent<HTMLElement>) => {
        const cancel = {
            classroomId: session.classroomId,
            start: session.schedule.start,
            attendeeId: attendee.id
        }
        dispatch(sessionCancel(cancel))
        setAnchorEl(null);
    };

    const onSessionCheckin = async (e: any) => {
        if (e.target.checked) {
            const checkin = {
                classroomId: session.classroomId,
                start: session.schedule.start,
                attendeeId: attendee.id
            }
            dispatch(sessionCheckin(checkin))
        } else {
            const checkout = {
                sessionId: session.id || "",
                attendeeId: attendee.id,
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
                                {attendee.firstname.concat(" ").concat(attendee.lastname)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4} md={4}>
                        <CreditBox credit={attendee.credits?.amount}/>
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
                            <Switch size="small" defaultChecked={attendee.attendance === "CHECKED_IN"}
                                    color={attendeeLabelColor} onChange={onSessionCheckin}/>
                        </ThemeProvider>
                    </Grid>
                    <Grid item xs={3} md={3} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <ThemeProvider theme={theme}>
                            <Chip size="small" label={attendeeLabelStatus} color={attendeeLabelColor}/>
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
                                          disabled={attendee.attendance === "CHECKED_IN"}>
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

export const SessionDetails = (session: Session) => {

    let sessionStart = session.schedule.start;
    let sessionEnd = session.schedule.stop;
    let dateSubheader = formatFullDate(sessionStart)
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