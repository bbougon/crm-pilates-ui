import * as React from "react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {sessionCheckin} from "../../features/sessionsSlice";
import {Grid} from "@material-ui/core";
import {Box, Card, CardContent, CardHeader, Chip, Switch, Typography} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {format} from "date-fns";

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

const SessionAttendee = ({attendee, session}) => {

    const [attendeeLabelStatus] = useState(attendee.attendance === "REGISTERED" ? 'R' : 'C')
    const [attendeeLabelColor] = useState(attendee.attendance === "REGISTERED" ? 'primary' : 'success')

    const dispatch = useDispatch();

    const onSessionCheckin = async (e) => {
        if (e.target.checked) {
            const checkin = Object.assign({}, session, attendee)
            await dispatch(sessionCheckin(checkin))
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

const SessionAttendees = ({session}) => {

    const content = session.attendees.map((attendee) => (
        <SessionAttendee key={attendee.id} attendee={attendee} session={session}/>))
    return (
        <Grid container>
            {content}
        </Grid>
    )
}

export const SessionDetails = ({session}) => {

    return (
        <Card>
            <CardHeader title={session.name}
                        subheader={format(session.schedule.start, "yyyy-MM-dd H:mm").concat(" / ").concat(format(session.schedule.stop, "yyyy-MM-dd H:mm"))}
                        component="div"/>
            <CardContent>
                <SessionAttendees session={session}/>
            </CardContent>
        </Card>
    )
}