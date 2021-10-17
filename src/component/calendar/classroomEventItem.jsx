import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Grid} from "@material-ui/core";
import {Box, Typography} from "@mui/material";
import {blue} from "@mui/material/colors";
import {format} from "date-fns";
import * as React from "react";

const theme = createTheme({
    typography: {
        h5: {
            fontSize: "0.7rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 800,
            lineHeight: 1.334,
            letterSpacing: "0em"
        },
        body1: {
            fontSize: "0.8rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "0em",
        },
        fontSize: 10
    },
});

export const ClassroomEventItem = ({classroom}) => {
    return (
        <Grid container>
            <Grid item xs={6}>
                <ThemeProvider theme={theme}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start'
                    }}>
                        <Typography variant="body1">
                            {classroom.name}
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
                            {classroom.attendees.length} / {classroom.position}
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
                            {format(classroom.schedule.start, 'k:mm')}
                        </Typography>
                    </Box>
                </ThemeProvider>
            </Grid>
        </Grid>
    )
};