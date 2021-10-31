import * as React from "react";
import {useState} from "react";
import {Box, Card, CardContent, CardHeader, Fade, Grid, IconButton, ThemeProvider} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {Popper} from "@material-ui/core";
import {format} from "date-fns";
import {useMonthlyBody} from "@zach.codes/react-calendar";
import {createTheme} from "@mui/material/styles";
import {AddClassroomForm} from "../classroom/addClassroomForm";

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


export const AddClassroomItem = ({clients, onClassroomAdd}) => {
    let {day} = useMonthlyBody();

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
                    const cardHeader = "Add a classroom on ".concat(format(day, "yyyy-MM-dd"))
                    return (
                        <ThemeProvider theme={theme}>
                            <Fade {...TransitionProps} timeout={350}>
                                <Card sx={{minWidth: 450, maxWidth: 600, display: 'flex'}}>
                                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                        <CardHeader title={cardHeader} component="div"/>
                                        <CardContent>
                                            <AddClassroomForm date={day} clients={clients} onSubmitClick={(classroom) => onClassroomAdd(classroom)}/>
                                        </CardContent>
                                    </Box>
                                </Card>
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
                        <IconButton onClick={openAddClassRoomForm()}>
                            <AddIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>

        </Grid>
    )
}