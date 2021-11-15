import {useDispatch, useSelector} from "react-redux";
import * as React from "react";
import {useEffect, useState} from "react";
import {addMonths, format, getYear, isSameDay, parseISO, startOfMonth, subMonths} from "date-fns";
import {fetchSessions, Link, selectMonthlySessions, Session, SessionStatus} from "../../features/sessionsSlice";
import {MonthlyBody, MonthlyCalendar, useMonthlyBody, useMonthlyCalendar} from "@zach.codes/react-calendar";
import {Box} from "@material-ui/core";
import {fetchClients} from "../../features/clientsSlice";
import {Grid, List} from "@mui/material";
import {blueGrey} from "@mui/material/colors";
import {RootState} from "../../app/store";
import {ClassroomEventItem} from "./ClassroomEventItem";
import {AddClassroomItem} from "./AddClassroomItem";
import {ErrorMessage} from "../../features/errors";
import {DisplayError} from "../errors/DisplayError";


interface MonthlyDayProps {
    render(events: any): any
}

export interface PilatesMonthlyCalendarProps {
    date: Date
}

export const PilatesMonthlyCalendar = ({date}: PilatesMonthlyCalendarProps) => {

    const dispatch = useDispatch();
    let [currentMonth, setCurrentMonth] = useState(startOfMonth(date))
    const sessions = useSelector(selectMonthlySessions)
    const link = useSelector<RootState, Link | undefined>((state => state.sessions.link))
    const error: ErrorMessage[] = useSelector<RootState, ErrorMessage[]>((state => state.sessions.error))
    const status: SessionStatus = useSelector<RootState, SessionStatus>((state => state.sessions.status))

    useEffect(() => {
        dispatch(fetchSessions())
        dispatch(fetchClients())
    }, [dispatch])

    const handleClassroomAdded = async () => {
        dispatch(fetchSessions(link?.current.url))
    }

    const MonthlyDay = (props: MonthlyDayProps) => {
        let {locale} = useMonthlyCalendar()
        let {day, events} = useMonthlyBody()
        let dayNumber = format(day, 'd', {locale});

        const backgroundColor = isSameDay(day, new Date()) ? blueGrey[50] : "white"

        return (
            <Box
                aria-label={`Events for day ${dayNumber}`}
                className="rc-h-48 rc-p-2 rc-border-b-2 rc-border-r-2" sx={{bgcolor: backgroundColor}}
            >
                <Grid className="rc-flex rc-justify-between">
                    <Grid item className="rc-font-bold">{dayNumber}</Grid>
                    <Grid item className="lg:rc-hidden rc-block">
                        {format(day, 'EEEE', {locale})}
                    </Grid>
                </Grid>
                <Grid>
                    <List className="rc-divide-gray-200 rc-divide-y rc-overflow-hidden rc-max-h-36 rc-overflow-y-auto">
                        {props.render(events)}
                    </List>
                </Grid>
            </Box>
        );
    }


    const MonthlyNav = () => {
        let {currentMonth, onCurrentMonthChange} = useMonthlyCalendar();

        const onPeriodClick = async (date: Date, link: string | undefined) => {
            await dispatch(fetchSessions(link))
            onCurrentMonthChange(date)
        }

        return (
            <Grid container direction="row" justifyContent="flex-end">
                <Grid item xs={4} md={1} sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => onPeriodClick(subMonths(currentMonth, 1), link?.previous.url)}
                        className="cursor-pointer">
                        Previous
                    </button>
                </Grid>
                <Grid item xs={4} md={1} sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    {format(
                        currentMonth,
                        getYear(currentMonth) === getYear(new Date()) ? 'LLLL' : 'LLLL yyyy'
                    )}
                </Grid>
                <Grid item xs={4} md={1} sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => onPeriodClick(addMonths(currentMonth, 1), link?.next.url)}
                        className="cursor-pointer">
                        Next
                    </button>
                </Grid>
            </Grid>
        );
    };


    function mapToCalendarEvent(session: Session) {
        return {
            ...session,
            date: parseISO(`${session.schedule.start}`)
        }
    }

    let content = undefined
    if (status === SessionStatus.FAILED || status === SessionStatus.CHECKIN_IN_FAILED || status === SessionStatus.CHECKOUT_FAILED) {
        content = <DisplayError {...{error: error}}/>
    }

    return (
        <MonthlyCalendar
            currentMonth={currentMonth}
            onCurrentMonthChange={date => setCurrentMonth(date)}>
            {content}
            <MonthlyNav/>
            <MonthlyBody events={sessions.map(session => mapToCalendarEvent(session))} omitDays={[0]}>
                <MonthlyDay
                    {...{
                        render: (data) => {
                            let events = data.map((item: Session, index: number) => (
                                <ClassroomEventItem key={index} {...item} />
                            ));
                            events.push(<AddClassroomItem key={Math.random()} onClassroomAdded={handleClassroomAdded}/>)
                            return events
                        }
                    }}
                />
            </MonthlyBody>
        </MonthlyCalendar>
    );
};