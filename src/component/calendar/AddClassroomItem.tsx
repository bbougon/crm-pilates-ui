import * as React from "react";
import {BaseSyntheticEvent, useState} from "react";
import {Box, Card, ClickAwayListener, Fade, Grid, IconButton, ThemeProvider} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {Popper} from "@material-ui/core";
import {useMonthlyBody} from "@zach.codes/react-calendar";
import {createTheme} from "@mui/material/styles";
import {AddClassroomForm} from "../classroom/AddClassroomForm";

const theme = createTheme({
    typography: {
        h5: {
            fontSize: "0.9rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 800,
            lineHeight: 1.334,
            letterSpacing: "0em",
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
});

type AddClassroomItemProps = {
    onClassroomAdded: () => void
}

export const AddClassroomItem = ({onClassroomAdded}: AddClassroomItemProps) => {
    const {day} = useMonthlyBody();

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const openAddClassRoomForm = () => (event: BaseSyntheticEvent) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    }

    const closeClassroomForm = () => {
        setOpen(false)
    }

    const handleClassroomAdded = () => {
        onClassroomAdded()
    }

    return (
        <Grid container>
            <Popper open={open} anchorEl={anchorEl} placement="right-start" transition>
                {({TransitionProps}) => {
                    return (
                        <ThemeProvider theme={theme}>
                            <Fade {...TransitionProps} timeout={350}>
                                <Box sx={{minWidth: 450, maxWidth: 600, display: 'flex'}}>
                                    <ClickAwayListener
                                        mouseEvent="onMouseDown"
                                        touchEvent="onTouchStart"
                                        onClickAway={closeClassroomForm}>
                                        <Card>
                                            <AddClassroomForm date={day} onClassroomAdded={handleClassroomAdded}/>
                                        </Card>
                                    </ClickAwayListener>
                                </Box>
                            </Fade>
                        </ThemeProvider>
                    )
                }}
            </Popper>
            <Grid container>
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>

                        <IconButton onClick={openAddClassRoomForm()} >
                            <AddIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>

        </Grid>
    )
}