import {CardContent, Stack} from "@mui/material";
import {Card, Grid, Typography} from "@material-ui/core";
import * as React from "react";

export const DisplayError = ({error}) => {
    let errorMessage
    errorMessage = error.map((error) => {
        return (
            <Stack key={Math.random()}>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <Typography>{error.message}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <Typography>{error.type}</Typography>
                </Stack>
            </Stack>
        )
    })
    return (
        <Grid item xs={12}>
            <Card>
                <CardContent sx={{color: 'error.main'}}>
                    <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                        <Typography variant="h5">An error occurred (see message below):</Typography>
                    </Stack>
                    {errorMessage}
                </CardContent>
            </Card>
        </Grid>
    )
}