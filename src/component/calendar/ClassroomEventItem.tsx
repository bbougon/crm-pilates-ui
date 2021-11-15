import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Grid} from "@material-ui/core";
import {Box, Card, ClickAwayListener, Fade, Popper, Typography} from "@mui/material";
import {blue} from "@mui/material/colors";
import * as React from "react";
import {useState} from "react";
import {formatHours} from "../../utils/date";
import {Session} from "../../features/sessionsSlice";
import {SessionDetails} from "../classroom/SessionDetails";

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


export const ClassroomEventItem = (session: Session) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const displaySession = () => (event: any) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    }

    const closeSessionDisplay = () => {
        setOpen(false)
    }

    return (
        <Grid container>
            <Popper open={open} anchorEl={anchorEl} placement="right-start" transition>
                {({TransitionProps}) => {
                    return (
                        <ThemeProvider theme={theme}>
                            <Fade {...TransitionProps} timeout={350}>
                                <Card sx={{minWidth: 500, maxWidth: 600, display: 'flex'}}>
                                    <ClickAwayListener onClickAway={closeSessionDisplay}
                                                       disableReactTree={false}>

                                        <Box sx={{width: 1, display: 'flex', flexDirection: 'column'}}>
                                            <SessionDetails {...session}/>
                                        </Box>
                                    </ClickAwayListener>
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
                                {session?.attendees?.length} / {session.position}
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
                                {formatHours(session.schedule.start)}
                            </Typography>
                        </Box>
                    </ThemeProvider>
                </Grid>
            </Grid>
        </Grid>
    )
};