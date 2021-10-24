import '@zach.codes/react-calendar/dist/calendar-tailwind.css';
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {isAfter, startOfMonth} from 'date-fns';
import {MonthlyBody, MonthlyCalendar, MonthlyDay, MonthlyNav,} from '@zach.codes/react-calendar';
import {ClassroomEventItem} from "./classroomEventItem";
import {AddClassroomItem} from "./addClassroomItem";
import {useDispatch, useSelector} from "react-redux";
import {fetchSessions, selectMonthlySessions, sessionStatuses} from "../../features/sessionsSlice";


export const PilatesMonthlyCalendar = ({date}) => {

    const dispatch = useDispatch();
    let [currentMonth, setCurrentMonth] = useState(startOfMonth(date))
    const link = useSelector((state => state.sessions.link))
    const sessions = useSelector(selectMonthlySessions)
    const status = useSelector((state => state.sessions))


    const handleCurrentMonth = (date, link) => {
        const fetchSessionsForDate = async() => {
            await dispatch(fetchSessions({date: date, link: link}))
        }
        setCurrentMonth(date)
        fetchSessionsForDate().catch((error) => console.log(error)).then((result) => console.log(result))
    }

    useEffect(() => {
        dispatch(fetchSessions({date: currentMonth})).then((res) => console.log(res))

    }, [dispatch])

    if (status.status === sessionStatuses.SUCCEEDED) {
        console.log(link)
    }


    return (
        <MonthlyCalendar
            currentMonth={currentMonth}
            onCurrentMonthChange={date => {
                handleCurrentMonth(date, link)
            }}>
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