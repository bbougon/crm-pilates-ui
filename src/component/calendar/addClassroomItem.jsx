import * as React from "react";
import {Box, Grid, IconButton, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useState} from "react";
import {Popper} from "@material-ui/core";
import {format} from "date-fns";
import {useMonthlyBody, useMonthlyCalendar} from "@zach.codes/react-calendar";

export const AddClassroomItem = () => {
    let { day } = useMonthlyBody();

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const openAddClassRoomForm = () => (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    }

    return (
        <Grid container>
            <Popper open={open} anchorEl={anchorEl} placement="right-start" transition>
                {({TransitionProps}) => {
                    return (
                        <Grid container>
                            <Typography>Add a classroom on {format(day, "yyyy-MM-dd")}</Typography>
                        </Grid>
                    )
                }}
            </Popper>
            <Grid container>
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <IconButton onClick={openAddClassRoomForm()}>
                            <AddIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>

        </Grid>
    )
}