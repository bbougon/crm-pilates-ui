import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Grid} from "@material-ui/core";
import {Box, Typography} from "@mui/material";
import {blue} from "@mui/material/colors";
import * as React from "react";
import {formatHours} from "../../utils/date";
import {Session} from "../../features/domain/session";
import {useDispatch} from "react-redux";
import {selectedSession} from "../../features/sessionsSlice";
import {useDrawer} from "../../hooks/useDrawer";
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


export const ClassroomEventItem = ({session}: {session: Session}) => {

    const {display} = useDrawer();
    return (
        <Grid container>
            <Grid container onClick={() => display(<SessionDetails session={session}/>)}>
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