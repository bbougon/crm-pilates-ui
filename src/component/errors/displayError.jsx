import {CardContent, Stack, Typography} from "@mui/material";
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import {Card, Grid} from "@material-ui/core";
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
        fontSize: "0.7rem"
    },
});

const ErrorTypography = styled(Typography)(({theme}) => ({
    h5: {
        fontSize: theme.h5.fontSize
    },
}));

export const DisplayError = ({error}) => {

    let errorMessage
    errorMessage = error.map((error) => {
        return (
            <Stack key={Math.random()}>
                <Stack direction="row" spacing={2} sx={{alignItems: "center", fontSize: "small"}}>
                    <ThemeProvider theme={theme}>
                        <Typography>{error.message}</Typography>
                    </ThemeProvider>
                </Stack>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <ThemeProvider theme={theme}>
                        <Typography>{error.type}</Typography>
                    </ThemeProvider>
                </Stack>
            </Stack>
        )
    })
    return (
        <Grid item xs={12}>
            <Card>
                <CardContent sx={{color: 'error.main', fontSize: "xx-small"}}>
                    <Stack direction="row" spacing={2} sx={{alignItems: "center", fontSize: "xx-small"}}>
                        <ThemeProvider theme={theme}>
                            <Typography variant="h5">An error occurred (see message below):</Typography>
                        </ThemeProvider>
                    </Stack>
                    {errorMessage}
                </CardContent>
            </Card>
        </Grid>
    )
}