import '@zach.codes/react-calendar/dist/calendar-tailwind.css';
import * as React from "react";
import {useState} from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {addHours, startOfMonth, subHours} from 'date-fns';
import {MonthlyBody, MonthlyCalendar, MonthlyDay, MonthlyNav,} from '@zach.codes/react-calendar';
import {ClassroomEventItem} from "./classroomEventItem";


export const PilatesMonthlyCalendar = () => {
    let [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))

    return (
        <MonthlyCalendar
            currentMonth={currentMonth}
            onCurrentMonthChange={date => setCurrentMonth(date)}
        >
            <MonthlyNav/>
            <MonthlyBody
                events={[
                    {
                        id: undefined,
                        classroomId: 1,
                        name: 'Pilates avancé',
                        date: subHours(new Date(), 5),
                        schedule: {
                            start: subHours(new Date(), 5),
                            stop: subHours(new Date(), 4),
                        },
                        position: 3,
                        attendees: [{id: 1, firstname: "Laurent", lastname: "Gas"}, {
                            id: 2,
                            firstname: "Pierre",
                            lastname: "Bernard"
                        }]
                    },
                    {
                        id: 1,
                        classroomId: 1,
                        name: 'Pilates machine',
                        date: subHours(new Date(), 4),
                        schedule: {
                            start: subHours(new Date(), 4),
                            stop: subHours(new Date(), 3),
                        },
                        position: 3,
                        attendees: [{id: 3, firstname: "Bertrand", lastname: "Bougon"}]
                    },
                    {
                        id: 2,
                        classroomId: 2,
                        name: 'Pilates tapis',
                        date: subHours(new Date(), 3),
                        schedule: {
                            start: subHours(new Date(), 3),
                            stop: subHours(new Date(), 2),
                        },
                        position: 4,
                        attendees: []
                    },
                    {
                        id: undefined,
                        classroomId: 3,
                        name: 'Cours duo',
                        date: subHours(new Date(), 2),
                        schedule: {
                            start: subHours(new Date(), 2),
                            stop: subHours(new Date(), 1),
                        },
                        position: 2,
                        attendees: []
                    },
                    {
                        id: 13,
                        classroomId: 1,
                        name: 'Cours trio',
                        date: subHours(new Date(), 1),
                        schedule: {
                            start: subHours(new Date(), 1),
                            stop: new Date(),
                        },
                        position: 3,
                        attendees: []
                    },
                    {
                        id: 4,
                        classroomId: 1,
                        name: 'Cours privé',
                        date: new Date(),
                        schedule: {
                            start: new Date(),
                            stop: addHours(new Date(), 1),
                        },
                        position: 1,
                        attendees: [{id: 3, firstname: "Bertrand", lastname: "Bougon"}]
                    },
                ]}
            >
                <MonthlyDay
                    renderDay={data =>
                        data.map((item, index) => (
                            <ClassroomEventItem
                                key={index}
                                classroom={item}
                            />
                        ))
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
                            <PilatesMonthlyCalendar/>
                        </>
                    </Grid>
                </Grid>
            </MainContainer>
        )
    }
}

export default Calendar;