import * as React from "react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {Attendee, Session, sessionCheckin} from "../../features/sessionsSlice";
import {Box, Grid, Card, CardContent, CardHeader, Chip, Typography, Switch} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {formatFullDate, formatHours} from "../../utils/date";

const theme = createTheme({
    typography: {
        h5: {
            fontSize: "0.9rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 800,
            lineHeight: 1.334,
            letterSpacing: "0em",
            textTransform: "uppercase"
        },
        body1: {
            fontSize: "0.8rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "0em",
        },
        fontSize: 12
    },
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
    const [attendeeLabelStatus] = useState(attendee.attendance === "REGISTERED" ? 'R' : 'C')
    const [attendeeLabelColor] = useState<'primary' | 'success'>(attendee.attendance === "REGISTERED" ? 'primary' : 'success')

    const dispatch = useDispatch();

    const onSessionCheckin = async (e: any) => {
        if (e.target.checked) {
            const checkin = {
                classroomId: session.classroomId,
                start: session.schedule.start,
                attendeeId: attendee.id
            }
            dispatch(sessionCheckin(checkin))
        }
    }

    return (
        <Grid container direction="row">
            <Grid item xs={8} md={8}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start'
                }}>
                    <Typography variant="body1">
                        {attendee.firstname.concat(" ").concat(attendee.lastname)}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} md={4}>
                <Grid container direction="row">
                    <Grid item xs={6} md={6} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <ThemeProvider theme={theme}>
                            <Switch size="small" defaultChecked={attendee.attendance === "CHECKED_IN"}
                                    color={attendeeLabelColor} onChange={onSessionCheckin}/>
                        </ThemeProvider>
                    </Grid>
                    <Grid item xs={6} md={6} sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <ThemeProvider theme={theme}>
                            <Chip size="small" label={attendeeLabelStatus} color={attendeeLabelColor}/>
                        </ThemeProvider>
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
        .concat(" / ")
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