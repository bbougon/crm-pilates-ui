import React, {ReactElement} from 'react';
import {SessionDetails} from "./SessionDetails";
import {
    apiAttendee,
    apiSession,
    attendee,
    AttendeesBuilder,
    schedule,
    session
} from "../../test-utils/classroom/session";
import {addHours, parseISO} from "date-fns";
import {Attendance, Session} from "../../features/domain/session";
import {Provider} from 'react-redux';
import {configureStore, createSlice} from '@reduxjs/toolkit';
import {SessionStatus} from "../../features/sessionsSlice";
import {store} from "../../app/store";
import {compose, context, rest} from "msw";
import {checkinResponse} from "../../test-utils/classroom/checkin";
import {fireEvent, waitFor, within} from "@storybook/testing-library";
import { expect } from '@storybook/jest';
import {ComponentStory} from "@storybook/react";

type State = {
    sessions: Session[]
    status: SessionStatus,
    error: [],
    link: string | undefined
}

const MockedState: State = {
    sessions: [session("1", "1", "Cours privé", "MAT",
        schedule(parseISO("2021-10-09T10:00:00"), parseISO("2021-10-09T11:00:00")), 1,
        new AttendeesBuilder()
            .withAttendee(attendee("1", "Bruno", "Germain", Attendance.CHECKED_IN))
            .build())],
    status: SessionStatus.IDLE,
    error: [],
    link: undefined
}

type MockStoreProps = {
    sessionState: State
    children: ReactElement
}


const Mockstore = ({sessionState, children}: MockStoreProps) => (
    <Provider
        store={configureStore({
            reducer: {
                sessions: createSlice({
                    name: 'sessions',
                    initialState: sessionState,
                    reducers: {},
                    extraReducers: {}
                }).reducer,
            },
        })}
    >
        {children}
    </Provider>
);

export default {
    component: SessionDetails,
    title: 'Session Details',
    decorators: [(story: any) => <Provider store={store}>{story()}</Provider>],
    excludeStories: /.*MockedState$/,
};

const Template: ComponentStory<typeof SessionDetails> = (args) => <SessionDetails {...args} />;

export const Default = Template.bind({});
Default.decorators = [
    (story: any) => <Mockstore sessionState={MockedState}>{story()}</Mockstore>,
]
Default.args = {
    ...session("15", "1", "Cours Duo", "MAT",
        schedule(parseISO("2021-10-09T10:00:00"), parseISO("2021-10-09T11:00:00")), 2,
        new AttendeesBuilder()
            .withAttendee(attendee("3", "Bertrand", "Bougon", Attendance.REGISTERED))
            .build())
};

Default.parameters = {
    msw: {
        handlers: [
            rest.post("http://localhost/sessions/checkin", (req, res, _) => {
                return res(compose(
                    context.status(201),
                    context.json(checkinResponse("15", "1",
                        apiSession("15", "1", "Cours Duo", "MAT",
                            schedule(parseISO("2021-10-09T10:00:00"),
                                addHours(parseISO("2021-10-09T10:00:00"), 1)),
                            2,
                            [apiAttendee("3", "Bertrand", "Bougon", Attendance.CHECKED_IN)])))
                ))
            })
        ],
    },
};

Default.play = async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Waits for the component to be updated based on the store
    await waitFor(async () => {
        await fireEvent.click(canvas.getByRole('checkbox'));
    });
    await expect(canvas.getByText('C')).toBeInTheDocument()
};