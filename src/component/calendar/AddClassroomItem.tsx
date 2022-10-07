import * as React from "react";
import {Box, Grid, IconButton} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useMonthlyBody} from "@zach.codes/react-calendar";
import {AddClassroomForm} from "../classroom/AddClassroomForm";
import {useDrawer} from "../../hooks/useDrawer";

type AddClassroomItemProps = {
    onClassroomAdded: () => void
}

export const AddClassroomItem = ({onClassroomAdded}: AddClassroomItemProps) => {
    const {day} = useMonthlyBody();
    const {display} = useDrawer();

    return (
        <Grid container>
            <Grid item xs={12}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>

                    <IconButton
                        onClick={() => display(<AddClassroomForm date={day}
                                                                 onClassroomAdded={() => onClassroomAdded()}/>)}>
                        <AddIcon fontSize="small"/>
                    </IconButton>
                </Box>
            </Grid>
        </Grid>
    )
}