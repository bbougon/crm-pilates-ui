import "@zach.codes/react-calendar/dist/calendar-tailwind.css";
import * as React from "react";
import { MainContainer } from "../../const/containers";
import { PilatesMonthlyCalendar } from "./PilatesMonthlyCalendar";
import { Grid } from "@mui/material";

export const Calendar = ({ date }: { date: Date }) => {
  return (
    <MainContainer>
      <Grid container>
        <Grid item xs={11}>
          <PilatesMonthlyCalendar date={date || new Date()} />
        </Grid>
      </Grid>
    </MainContainer>
  );
};

export default Calendar;
