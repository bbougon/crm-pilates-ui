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
import {Attendance, Attendee, Session} from "../../features/domain/session";
import {Provider} from 'react-redux';
import {configureStore, createSlice} from '@reduxjs/toolkit';
import {sessionCheckin, SessionStatus} from "../../features/sessionsSlice";
import {store} from "../../app/store";
import {compose, context, rest} from "msw";
import {checkinResponse} from "../../test-utils/classroom/checkin";
import {fireEvent, screen, userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from '@storybook/jest';
import {ComponentStory} from "@storybook/react";
import {AuthStatus} from "../../features/auth";
import {ApiAttendee, ApiSession} from "../../api";
import {Subjects} from "../../features/domain/subjects";

type State = {
    sessions: Session[]
    selectedSession: Session | undefined
    status: SessionStatus
    error: []
    link: string | undefined
}

const defaultSession: Session =
    session("1", "1", "Cours privé", "MAT",
        schedule(parseISO("2021-10-09T10:00:00"), parseISO("2021-10-09T11:00:00")), 1,
        new AttendeesBuilder()
            .withAttendee(attendee("1", "Bruno", "Germain", Attendance.REGISTERED, {amount: 5}))
            .build())


const MockedState: State = {
    sessions: [defaultSession],
    selectedSession: defaultSession,
    status: SessionStatus.IDLE,
    error: [],
    link: undefined
}

type MockStoreProps = {
    sessionState: State
    children: ReactElement
}


const Mockstore = ({sessionState, children}: MockStoreProps) => {
    return (
        <Provider
            store={configureStore({
                reducer: {
                    sessions: createSlice({
                        name: 'sessions',
                        initialState: sessionState,
                        reducers: {},
                        extraReducers(builder) {
                            const mapSession = (apiSession: ApiSession): Session => {

                                return {
                                    id: apiSession.id,
                                    classroomId: apiSession.classroom_id,
                                    name: apiSession.name,
                                    subject: apiSession.subject as Subjects,
                                    schedule: {
                                        start: apiSession.schedule.start,
                                        stop: apiSession.schedule.stop
                                    },
                                    position: apiSession.position,
                                    attendees: apiSession.attendees?.map(attendee => mapAttendee(attendee))
                                }
                            }
                            const mapAttendee = (attendee: ApiAttendee): Attendee => {
                                return {
                                    id: attendee.id,
                                    firstname: attendee.firstname,
                                    lastname: attendee.lastname,
                                    attendance: attendee.attendance as Attendance,
                                    credits: {amount: attendee.credits?.amount}
                                }
                            }
                            builder
                                .addCase(sessionCheckin.fulfilled, (state, action) => {
                                    state.status = SessionStatus.CHECKIN_IN_SUCCEEDED
                                    const sessionCheckedIn = action.payload
                                    state.selectedSession = mapSession(sessionCheckedIn)
                                })
                        }
                    }).reducer,
                    login: createSlice({
                        name: 'login',
                        initialState: {
                            token: {token: "token", type: "bearer"},
                            status: AuthStatus.SUCCEEDED,
                            error: []
                        },
                        reducers: {},
                        extraReducers: {}
                    }).reducer
                },
            })}
        >
            {children}
        </Provider>
    )
};

export default {
    component: SessionDetails,
    title: 'Session Details',
    decorators: [(story: any) => <Provider store={store}>{story()}</Provider>],
    excludeStories: /.*MockedState$/,
};

const Template: ComponentStory<typeof SessionDetails> = (args) => <SessionDetails {...args} />;

export const DisplaySessionDetails = Template.bind({});
export const SessionCheckin = Template.bind({});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

DisplaySessionDetails.decorators = [
    (story: any) => <Mockstore sessionState={MockedState}>{story()}</Mockstore>,
]
DisplaySessionDetails.args = {
    ...defaultSession
};

DisplaySessionDetails.parameters = {
    msw: {
        handlers: [],
    },
};

DisplaySessionDetails.play = async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await sleep(20);

    await expect(canvas.getByText('5')).toBeInTheDocument()
    await expect(canvas.getByText('R')).toBeInTheDocument()
};

SessionCheckin.decorators = [
    (story: any) => <Mockstore sessionState={MockedState}>{story()}</Mockstore>,
]
SessionCheckin.args = {
    ...defaultSession
};

SessionCheckin.parameters = {
    msw: {
        handlers: [
            rest.post("http://localhost:8081/sessions/checkin", (req, res, _) => {
                const response = checkinResponse(defaultSession.id ?? "1", defaultSession.classroomId,
                    apiSession(defaultSession.id, defaultSession.classroomId, defaultSession.name, defaultSession.subject.toString(),
                        schedule(parseISO(defaultSession.schedule.start),
                            addHours(parseISO(defaultSession.schedule.start), 1)),
                        defaultSession.position,
                        [apiAttendee("1", "Bruno", "Germain", Attendance.CHECKED_IN, {amount: 4})]));
                return res(compose(
                    context.status(201),
                    context.json(response)
                ))
            })
        ],
    },
};

SessionCheckin.play = async ({canvasElement}) => {
    const canvas = await waitFor(() => within(canvasElement));

    await userEvent.click(canvas.getByRole('checkbox'));
    await sleep(100);

    await expect(canvas.getByText('4')).toBeInTheDocument()
    await expect(canvas.getByText('C')).toBeInTheDocument()

    await waitFor(async () => {
        await fireEvent.click(canvas.getByRole('button', {name: /more/i}))
    })

    const presentation = within(screen.getByRole('presentation'))
    await expect(presentation.getByRole('menuitem', {name: /cancel/i})).toHaveAttribute("aria-disabled")
};