import {useDispatch, useSelector} from "react-redux";
import * as React from "react";
import {useEffect, useState} from "react";
import {addMonths, format, getYear, isSameDay, startOfMonth, subMonths} from "date-fns";
import {fetchSessions, selectMonthlySessions, sessionCheckin} from "../../features/sessionsSlice";
import {addClassroom} from "../../features/classroomSlice";
import {MonthlyBody, MonthlyCalendar, useMonthlyBody, useMonthlyCalendar} from "@zach.codes/react-calendar";
import {Grid} from "@material-ui/core";
import {AddClassroomItem} from "./addClassroomItem";
import {ClassroomEventItem} from "./classroomEventItem";
import {fetchClients, selectAllClients} from "../../features/clientsSlice";
import {Box, List} from "@mui/material";
import {blueGrey} from "@mui/material/colors";

export const PilatesMonthlyCalendar = ({date}) => {

    const dispatch = useDispatch();
    let [currentMonth, setCurrentMonth] = useState(startOfMonth(date))
    const sessions = useSelector(selectMonthlySessions)
    const link = useSelector((state => state.sessions.link))
    const clients = useSelector(selectAllClients);

    useEffect(() => {
        dispatch(fetchSessions())
        dispatch(fetchClients())
    }, [dispatch])

    const onClassroomAdd = async (classroom) => {
        await dispatch(addClassroom(classroom))
        await dispatch(fetchSessions(link.current.url))
    }

    const  onSessionCheckin = async (session, attendee) => {
        const checkin = Object.assign({}, session, attendee)
        await dispatch(sessionCheckin(checkin))
    }

    const MonthlyDay = ({ renderDay }) => {
        let { locale } = useMonthlyCalendar()
        let { day, events } = useMonthlyBody()
        let dayNumber = format(day, 'd', { locale });

        const backgroundColor = isSameDay(day, new Date()) ? blueGrey[50] : "white"

        return (
            <Box direction="row"
                aria-label={`Events for day ${dayNumber}`}
                className="rc-h-48 rc-p-2 rc-border-b-2 rc-border-r-2" sx={{bgcolor: backgroundColor}}
            >
                <Grid className="rc-flex rc-justify-between">
                    <Grid item className="rc-font-bold">{dayNumber}</Grid>
                    <Grid item className="lg:rc-hidden rc-block">
                        {format(day, 'EEEE', { locale })}
                    </Grid>
                </Grid>
                <Grid>
                    <List className="rc-divide-gray-200 rc-divide-y rc-overflow-hidden rc-max-h-36 rc-overflow-y-auto">
                        {renderDay(events)}
                    </List>
                </Grid>
            </Box>
        );
    }


    const MonthlyNav = () => {
        let {currentMonth, onCurrentMonthChange} = useMonthlyCalendar();

        const onPeriodClick = async (date, link) => {
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
                        onClick={() => onPeriodClick(subMonths(currentMonth, 1), link.previous.url)}
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
                        onClick={() => onPeriodClick(addMonths(currentMonth, 1), link.next.url)}
                        className="cursor-pointer">
                        Next
                    </button>
                </Grid>
            </Grid>
        );
    };

    return (
        <MonthlyCalendar
            currentMonth={currentMonth}
            onCurrentMonthChange={date => setCurrentMonth(date)}>
            <MonthlyNav/>
            <MonthlyBody events={sessions} omitDays={[0]}>
                <MonthlyDay
                    renderDay={data => {
                        let events = data.map((item, index) => (
                            <ClassroomEventItem
                                key={index}
                                classroom={item}
                                onSessionCheckin={(session, attendee) => onSessionCheckin(session, attendee)}
                            />
                        ));
                        events.push(<AddClassroomItem key={Math.random()} clients={clients} onClassroomAdd={(classroom) => onClassroomAdd(classroom)}/>)
                        return events
                    }
                    }
                />
            </MonthlyBody>
        </MonthlyCalendar>
    );
};