import '@zach.codes/react-calendar/dist/calendar-tailwind.css';
import * as React from "react";
import {useEffect, useState} from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {addMonths, format, getYear, startOfMonth, subMonths} from 'date-fns';
import {MonthlyBody, MonthlyCalendar, MonthlyDay, useMonthlyCalendar} from '@zach.codes/react-calendar';
import {ClassroomEventItem} from "./classroomEventItem";
import {AddClassroomItem} from "./addClassroomItem";
import {useDispatch, useSelector} from "react-redux";
import {fetchSessions, selectMonthlySessions} from "../../features/sessionsSlice";


export const PilatesMonthlyCalendar = ({date}) => {

    const dispatch = useDispatch();
    let [currentMonth, setCurrentMonth] = useState(startOfMonth(date))
    const sessions = useSelector(selectMonthlySessions)

    useEffect(() => {
        dispatch(fetchSessions())
    }, [dispatch])

    const MonthlyNav = () => {
        let {currentMonth, onCurrentMonthChange} = useMonthlyCalendar();
        const link = useSelector((state => state.sessions.link))


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
                        className="cursor-pointer"
                    >
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
                        events.push(<AddClassroomItem key={Math.random()}/>)
                        return events
                    }
                    }
                />
            </MonthlyBody>
        </MonthlyCalendar>
    );
};

export class Calendar extends React.Component {

    render() {
        return (
            <MainContainer>
                <Grid container>
                    <Grid item xs={11}>
                        <>
                            <PilatesMonthlyCalendar date={this.props.date || new Date()}/>
                        </>
                    </Grid>
                </Grid>
            </MainContainer>
        )
    }
}

export default Calendar;