import '@zach.codes/react-calendar/dist/calendar-tailwind.css';
import * as React from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {PilatesMonthlyCalendar} from "./PilatesMonthlyCalendar";

export const Calendar = ({date}: { date: Date }) => {
    return (
        <MainContainer>
            <Grid container>
                <Grid item xs={11}>
                    <PilatesMonthlyCalendar date={date || new Date()} />
                </Grid>
            </Grid>
        </MainContainer>
    )
}


export default Calendar;