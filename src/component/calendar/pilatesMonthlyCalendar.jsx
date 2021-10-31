import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {addMonths, format, getYear, startOfMonth, subMonths} from "date-fns";
import {fetchSessions, selectMonthlySessions} from "../../features/sessionsSlice";
import {addClassroom} from "../../features/classroomSlice";
import {MonthlyBody, MonthlyCalendar, MonthlyDay, useMonthlyCalendar} from "@zach.codes/react-calendar";
import {Grid} from "@material-ui/core";
import {AddClassroomItem} from "./addClassroomItem";
import * as React from "react";
import {ClassroomEventItem} from "./classroomEventItem";
import {fetchClients, selectAllClients} from "../../features/clientsSlice";

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
            <MonthlyBody events={sessions}>
                <MonthlyDay
                    renderDay={data => {
                        let events = data.map((item, index) => (
                            <ClassroomEventItem
                                key={index}
                                classroom={item}
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