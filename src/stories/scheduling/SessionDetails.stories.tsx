import React, {ReactElement} from 'react';
import {
    ApiAttendeeBuilder,
    apiSession,
    AttendeeBuilder,
    AttendeesBuilder,
    ScheduleBuilder,
    session
} from "../../test-utils/classroom/session";
import {parseISO} from "date-fns";
import {Session} from "../../features/domain/session";
import {Provider} from 'react-redux';
import {configureStore, createSlice} from '@reduxjs/toolkit';
import {sessionCancel, sessionCheckin, sessionCheckout, SessionStatus} from "../../features/sessionsSlice";
import {store} from "../../app/store";
import {compose, context, rest} from "msw";
import {cancellationResponse, checkinResponse} from "../../test-utils/classroom/checkin";
import {fireEvent, screen, userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from '@storybook/jest';
import {ComponentStory} from "@storybook/react";
import {AuthStatus} from "../../features/auth";
import {SessionDetails} from "../../component/classroom/SessionDetails";
import SessionDetailsDoc from "./SessionDetails.docs.mdx";

type State = {
    sessions: Session[]
    status: SessionStatus
    error: []
    link: string | undefined
}

const defaultSession: Session =
    session("1", "1", "Cours privé", "MAT",
        new ScheduleBuilder("2021-10-09T10:00:00")
            .build(), 1,
        new AttendeesBuilder()
            .withAttendee(new AttendeeBuilder()
                .id("1")
                .firstname("Bruno")
                .lastname("Germain")
                .credits(5)
                .build())
            .build())

const sessionWithOneCheckedInAttendee: Session =
    session("2", "2", "Cours duo machine", "MACHINE_DUO",
        new ScheduleBuilder("2021-09-05T11:00:00")
            .build(), 2,
        new AttendeesBuilder()
            .withAttendee(new AttendeeBuilder()
                .id("1")
                .firstname("Bruno")
                .lastname("Germain")
                .checkedIn()
                .credits(4)
                .build())
            .build())


const SessionWithOneRegisteredAttendee: State = {
    sessions: [defaultSession],
    status: SessionStatus.IDLE,
    error: [],
    link: undefined
}

const SessionWithOneCheckedInAttendee: State = {
    sessions: [sessionWithOneCheckedInAttendee],
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
                            builder
                                .addCase(sessionCheckin.fulfilled, (state, action) => {
                                    state.status = SessionStatus.CHECKIN_IN_SUCCEEDED
                                })
                                .addCase(sessionCheckout.fulfilled, (state, action) => {
                                    state.status = SessionStatus.CHECKOUT_SUCCEEDED
                                })
                                .addCase(sessionCancel.fulfilled, (state, action) => {
                                    state.status = SessionStatus.CANCEL_SUCCEEDED
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
    parameters: {
        docs: {
            page: SessionDetailsDoc
        }
    }
};

const Template: ComponentStory<typeof SessionDetails> = (args) => <SessionDetails {...args} />;

export const DisplaySessionDetails = Template.bind({});
export const SessionCheckin = Template.bind({});
export const SessionCheckout = Template.bind({session: sessionWithOneCheckedInAttendee});
export const CancelSession = Template.bind({});

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
    #########################################################
    # Display default session details                       #
    #########################################################
 */
DisplaySessionDetails.decorators = [
    (story: any) => <Mockstore sessionState={SessionWithOneRegisteredAttendee}>{story()}</Mockstore>,
]
DisplaySessionDetails.args = {
    session: defaultSession
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

/*
    #########################################################
    # Perform checkin                                       #
    #########################################################
 */
SessionCheckin.decorators = [
    (story: any) => <Mockstore sessionState={SessionWithOneRegisteredAttendee}>{story()}</Mockstore>,
]
SessionCheckin.storyName = "Bruno Germain performs checkin"
SessionCheckin.args = {
    session: defaultSession
};
SessionCheckin.parameters = {
    msw: {
        handlers: [
            rest.post("http://localhost:8081/sessions/checkin", (req, res, _) => {
                const response = checkinResponse(defaultSession.id ?? "1", defaultSession.classroomId,
                    apiSession(defaultSession.id, defaultSession.classroomId, defaultSession.name, defaultSession.subject.toString(),
                        new ScheduleBuilder(defaultSession.schedule.start)
                            .build(),
                        defaultSession.position,
                        [new ApiAttendeeBuilder()
                            .withId("1")
                            .withFirstname("Bruno")
                            .withLastname("Germain")
                            .checkedIn()
                            .with_credits(4)
                            .build()]));
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

/*
    #########################################################
    # Perform Checkout                                      #
    #########################################################
 */
SessionCheckout.decorators = [
    (story: any) => <Mockstore sessionState={SessionWithOneCheckedInAttendee}>{story()}</Mockstore>,
]
SessionCheckout.storyName = "Bruno Germain performs checkout"
SessionCheckout.args = {
    session: sessionWithOneCheckedInAttendee
};
SessionCheckout.parameters = {
    msw: {
        handlers: [
            rest.post("http://localhost:8081/sessions/2/checkout", (req, res, _) => {
                const response = checkinResponse(sessionWithOneCheckedInAttendee.id ?? "1", sessionWithOneCheckedInAttendee.classroomId,
                    apiSession(sessionWithOneCheckedInAttendee.id, sessionWithOneCheckedInAttendee.classroomId, sessionWithOneCheckedInAttendee.name, sessionWithOneCheckedInAttendee.subject.toString(),
                        new ScheduleBuilder(sessionWithOneCheckedInAttendee.schedule.start)
                            .build(),
                        sessionWithOneCheckedInAttendee.position,
                        [new ApiAttendeeBuilder()
                            .withId("1")
                            .withFirstname("Bruno")
                            .withLastname("Germain")
                            .with_credits(5)
                            .build()]));
                return res(compose(
                    context.status(201),
                    context.json(response)
                ))
            })
        ],
    },
};

SessionCheckout.play = async ({canvasElement}) => {
    const canvas = await waitFor(() => within(canvasElement));
    await expect(canvas.getByText('4')).toBeInTheDocument()
    await expect(canvas.getByText('C')).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('checkbox'));
    await sleep(200);

    await expect(canvas.getByText('5')).toBeInTheDocument()
    await expect(canvas.getByText('R')).toBeInTheDocument()

    await waitFor(async () => {
        await fireEvent.click(canvas.getByRole('button', {name: /more/i}))
    })

    const presentation = within(screen.getByRole('presentation'))
    await expect(presentation.getByRole('menuitem', {name: /cancel/i})).not.toHaveAttribute("aria-disabled")
};

/*
    #########################################################
    # Cancel session                                        #
    #########################################################
 */
CancelSession.decorators = [
    (story: any) => <Mockstore sessionState={SessionWithOneRegisteredAttendee}>{story()}</Mockstore>,
]
CancelSession.storyName = "Bruno Germain cancel his session"
CancelSession.args = {
    session: defaultSession
};
CancelSession.parameters = {
    msw: {
        handlers: [
            rest.post("http://localhost:8081/sessions/cancellation/1", (req, res, _) => {
                const response = cancellationResponse(defaultSession.id ?? "1", defaultSession.classroomId,
                    apiSession(defaultSession.id, defaultSession.classroomId, defaultSession.name, defaultSession.subject.toString(),
                        new ScheduleBuilder(defaultSession.schedule.start)
                            .build(),
                        defaultSession.position));
                return res(compose(
                    context.status(201),
                    context.json(response)
                ))
            })
        ],
    },
};

CancelSession.play = async ({canvasElement}) => {
    const canvas = await waitFor(() => within(canvasElement));

    await expect(canvas.getByText('Bruno Germain')).toBeInTheDocument()

    await waitFor(async () => {
        await fireEvent.click(canvas.getByRole('button', {name: /more/i}))
    })

    const presentation = within(screen.getByRole('presentation'))
    await waitFor(async () => {
        await fireEvent.click(presentation.getByRole('menuitem', {name: /cancel/i}))
    })
    await sleep(200);

    expect(canvas.queryByText('Bruno Germain')).not.toBeInTheDocument()
};
