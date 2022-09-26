import '@zach.codes/react-calendar/dist/calendar-tailwind.css';
import * as React from "react";
import {useRef, useState} from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {PilatesMonthlyCalendar} from "./PilatesMonthlyCalendar";
import {Session} from "../../features/domain/session";
import {MyPopper} from "./Popper";
import {createPortal} from "react-dom";

export const Calendar = ({date}: { date: Date }) => {
    const [session, setSession] = useState<null | Session>(null);
    return (
        <MainContainer>
            <Grid container>
                <div id="portal"></div>
                <div>
                {
                    session ? createPortal(<MyPopper closeSessionDisplay={() => setSession(null)} session={session}/>, document.getElementById("portal")!) :null
                }
                </div>
                <Grid item xs={11}>
                    <PilatesMonthlyCalendar date={date || new Date()} displaySession={setSession}/>
                </Grid>
            </Grid>
        </MainContainer>
    )
}


export default Calendar;