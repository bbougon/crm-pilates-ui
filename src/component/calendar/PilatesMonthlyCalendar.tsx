import { useSelector } from "react-redux";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  addMonths,
  format,
  getYear,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  fetchSessions,
  selectMonthlySessions,
} from "../../features/sessionsSlice";
import {
  MonthlyBody,
  MonthlyCalendar,
  useMonthlyBody,
  useMonthlyCalendar,
} from "@zach.codes/react-calendar";
import { fetchClients } from "../../features/clientsSlice";
import { Box, Grid, List } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { RootState } from "../../app/store";
import { ClassroomEventItem } from "./ClassroomEventItem";
import { ClassroomSchedulingItem } from "../scheduling/ClassroomSchedulingItem";
import { Session, SessionsLink } from "../../features/domain/session";
import { useAppDispatch } from "../../hooks/redux";
import { useSnackbar } from "../../hooks/useSnackbar";

interface MonthlyDayProps<TEvent> {
  render(events: TEvent): JSX.Element[];
}

export interface PilatesMonthlyCalendarProps {
  date: Date;
}

export const PilatesMonthlyCalendar = ({
  date,
}: PilatesMonthlyCalendarProps) => {
  const dispatch = useAppDispatch();
  const { display } = useSnackbar();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(date));
  const sessions = useSelector(selectMonthlySessions);
  const link = useSelector<RootState, SessionsLink | undefined>(
    (state) => state.sessions.link
  );

  const errorCallback = useCallback((err) => {
    display(err, "error");
  }, []);

  useEffect(() => {
    dispatch(fetchSessions())
      .unwrap()
      .catch((err) => errorCallback(err));
  }, [dispatch, errorCallback]);

  useEffect(() => {
    dispatch(fetchClients())
      .unwrap()
      .catch((err) => errorCallback(err));
  }, [dispatch, errorCallback]);

  const MonthlyDay = (
    props: MonthlyDayProps<{ session: Session; date: Date }[]>
  ) => {
    const { locale } = useMonthlyCalendar();
    const { day, events } = useMonthlyBody<{ session: Session; date: Date }>();
    const dayNumber = format(day, "d", { locale });

    const backgroundColor = isSameDay(day, new Date()) ? blueGrey[50] : "white";

    return (
      <Box
        aria-label={`Events for day ${dayNumber}`}
        className="rc-h-48 rc-p-2 rc-border-b-2 rc-border-r-2"
        sx={{ bgcolor: backgroundColor }}
      >
        <Grid className="rc-flex rc-justify-between">
          <Grid item className="rc-font-bold">
            {dayNumber}
          </Grid>
          <Grid item className="lg:rc-hidden rc-block">
            {format(day, "EEEE", { locale })}
          </Grid>
        </Grid>
        <Grid>
          <List className="rc-divide-gray-200 rc-divide-y rc-overflow-hidden rc-max-h-36 rc-overflow-y-auto">
            {props.render(events)}
          </List>
        </Grid>
      </Box>
    );
  };

  const MonthlyNav = () => {
    const { currentMonth, onCurrentMonthChange } = useMonthlyCalendar();

    const onPeriodClick = async (date: Date, link: string | undefined) => {
      await dispatch(fetchSessions(link));
      onCurrentMonthChange(date);
    };

    return (
      <Grid container direction="row" justifyContent="flex-end">
        <Grid
          item
          xs={4}
          md={1}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() =>
              onPeriodClick(subMonths(currentMonth, 1), link?.previous.url)
            }
            className="cursor-pointer"
          >
            Previous
          </button>
        </Grid>
        <Grid
          item
          xs={4}
          md={1}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {format(
            currentMonth,
            getYear(currentMonth) === getYear(new Date()) ? "LLLL" : "LLLL yyyy"
          )}
        </Grid>
        <Grid
          item
          xs={4}
          md={1}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() =>
              onPeriodClick(addMonths(currentMonth, 1), link?.next.url)
            }
            className="cursor-pointer"
          >
            Next
          </button>
        </Grid>
      </Grid>
    );
  };

  function mapToCalendarEvent(session: Session): {
    session: Session;
    date: Date;
  } {
    return {
      session: { ...session },
      date: parseISO(`${session.schedule.start}`),
    };
  }

  return (
    <MonthlyCalendar
      currentMonth={currentMonth}
      onCurrentMonthChange={(date) => setCurrentMonth(date)}
    >
      <MonthlyNav />
      <MonthlyBody
        events={sessions.map((session) => mapToCalendarEvent(session))}
        omitDays={[0]}
      >
        <MonthlyDay
          {...{
            render: (data: { session: Session; date: Date }[]) => {
              const events = data.map(
                (item: { session: Session; date: Date }, index: number) => {
                  return (
                    <ClassroomEventItem key={index} session={item.session} />
                  );
                }
              );
              events.push(<ClassroomSchedulingItem key={Math.random()} />);
              return events;
            },
          }}
        />
      </MonthlyBody>
    </MonthlyCalendar>
  );
};
