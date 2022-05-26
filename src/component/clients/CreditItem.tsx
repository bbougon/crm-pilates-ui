import {Credits} from "../../features/domain/client";
import {Grid, Typography} from "@mui/material";
import {translate} from "../../utils/translation";
import {CreditBox} from "../CreditBox";
import * as React from "react";

type CreditItemProps = {
    credits: Credits | undefined
}
export const CreditItem = ({credits}: CreditItemProps) => {
    return <>
        <Grid item xs={2} sx={{
            display: 'flex',
            justifyContent: 'flex-start',
        }}>
            <Typography>{translate(credits?.subject)}</Typography>
        </Grid>
        <Grid item xs={1}>
            <CreditBox credit={credits?.value || 0}/>
        </Grid>
    </>;
}