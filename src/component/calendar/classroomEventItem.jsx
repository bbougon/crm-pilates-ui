import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Grid} from "@material-ui/core";
import {Box, Card, CardContent, CardHeader, Chip, Fade, Popper, Stack, Switch, Typography} from "@mui/material";
import {blue} from "@mui/material/colors";
import {format} from "date-fns";
import * as React from "react";
import {useState} from "react";

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

const Attendee = ({attendee}) => {
    const [attendeeLabelStatus, setAttendeeLabelStatus] = useState(attendee.attendance === "REGISTERED" ? 'R' : 'C')
    const [attendeeLabelColor, setAttendeeLabelColor] = useState(attendee.attendance === "REGISTERED" ? 'primary' : 'success')

    return (
        <Stack direction="row">
            <Grid container>
                <Grid item xs={8}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start'
                    }}>
                        <Typography variant="body1">
                            {attendee.firstname.concat(" ").concat(attendee.lastname)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Stack direction="row">
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <ThemeProvider theme={theme}>
                                <Switch size="small" defaultChecked={attendee.attendance === "CHECKED_IN"} color={attendeeLabelColor}/>
                            </ThemeProvider>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <ThemeProvider theme={theme}>
                                <Chip size="small" label={attendeeLabelStatus} color={attendeeLabelColor}/>
                            </ThemeProvider>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    )
}


const Attendees = ({attendees}) => {

    const content = attendees.map((attendee) => (<Attendee key={attendee.id} attendee={attendee}/>))
    return (
        <Stack direction="column" spacing={1}>
            {content}
        </Stack>
    )
}


export const ClassroomEventItem = ({classroom: session}) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const displaySession = () => (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    }

    return (
        <Grid container>
            <Popper open={open} anchorEl={anchorEl} placement="right-start" transition>
                {({TransitionProps}) => {
                    let subheader = format(session.schedule.start, "yyyy-MM-dd H:mm").concat(" / ").concat(format(session.schedule.stop, "yyyy-MM-dd H:mm"));
                    return (
                        <ThemeProvider theme={theme}>
                            <Fade {...TransitionProps} timeout={350}>
                                <Card>
                                    <CardHeader title={session.name}
                                                subheader={subheader}
                                                component="div"/>
                                    <CardContent>
                                        <Attendees attendees={session.attendees}/>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </ThemeProvider>
                    );
                }}
            </Popper>
            <Grid container onClick={displaySession()}>
                <Grid item xs={6}>
                    <ThemeProvider theme={theme}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-start'
                        }}>
                            <Typography variant="body1">
                                {session.name}
                            </Typography>
                        </Box>
                    </ThemeProvider>
                </Grid>
                <Grid item xs={2}>

                    <ThemeProvider theme={theme}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Typography color={blue[400]}>
                                {session.attendees.length} / {session.position}
                            </Typography>
                        </Box>
                    </ThemeProvider>
                </Grid>
                <Grid item xs={4}>

                    <ThemeProvider theme={theme}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Typography>
                                {format(session.schedule.start, 'k:mm')}
                            </Typography>
                        </Box>
                    </ThemeProvider>
                </Grid>
            </Grid>
        </Grid>
    )
};