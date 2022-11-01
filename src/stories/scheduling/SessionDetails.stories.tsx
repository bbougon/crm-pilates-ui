import React, { ReactElement } from "react";
import {
  ApiAttendeeBuilder,
  ApiSessionsBuilder,
  AttendeeBuilder,
  AttendeesBuilder,
  ScheduleBuilder,
  SessionBuilder,
} from "../../test-utils/classroom/session";
import { Session } from "../../features/domain/session";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import {
  sessionCancel,
  sessionCheckin,
  sessionCheckout,
  SessionStatus,
} from "../../features/sessionsSlice";
import { store } from "../../app/store";
import { compose, context, rest } from "msw";
import {
  cancellationResponse,
  checkinResponse,
} from "../../test-utils/classroom/checkin";
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentStory } from "@storybook/react";
import { AuthStatus } from "../../features/auth";
import { SessionDetails } from "../../component/classroom/SessionDetails";
import SessionDetailsDoc from "./SessionDetails.docs.mdx";
import { ErrorMessage } from "../../features/errors";
import { SnackbarProvider } from "../../context/SnackbarProvider";

type State = {
  sessions: Session[];
  status: SessionStatus;
  error: ErrorMessage[];
  link: string | undefined;
};

const error = { detail: [{ msg: "Error occurred", type: "Error" }] };

const defaultSession: Session = new SessionBuilder()
  .withId("1")
  .withClassroom("1")
  .withName("Cours privé")
  .withSchedule(new ScheduleBuilder("2021-10-09T10:00:00").build())
  .withPosition(1)
  .withAttendees(
    new AttendeesBuilder()
      .withAttendee(
        new AttendeeBuilder()
          .id("1")
          .firstname("Bruno")
          .lastname("Germain")
          .credits(5)
          .build()
      )
      .build()
  )
  .build();

const brunoGermain = new AttendeeBuilder()
  .id("1")
  .firstname("Bruno")
  .lastname("Germain")
  .checkedIn()
  .credits(4)
  .build();

const bertrandBougon = new AttendeeBuilder()
  .id("2")
  .firstname("Bertrand")
  .lastname("Bougon")
  .credits(5)
  .build();

const sessionWithOneCheckedInAttendee: Session = new SessionBuilder()
  .withId("2")
  .withClassroom("2")
  .withName("Cours duo machine")
  .withSchedule(new ScheduleBuilder("2021-09-05T11:00:00").build())
  .withPosition(2)
  .withAttendees(new AttendeesBuilder().withAttendee(brunoGermain).build())
  .build();

const sessionWithTwoAttendees: Session = new SessionBuilder()
  .withClassroom("3")
  .withName("Coours Mat duo")
  .withPosition(2)
  .withAttendees(
    new AttendeesBuilder()
      .withAttendee(brunoGermain)
      .withAttendee(bertrandBougon)
      .build()
  )
  .build();

const SessionWithTwoAttendees: State = {
  sessions: [sessionWithTwoAttendees],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const SessionWithOneRegisteredAttendee: State = {
  sessions: [defaultSession],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const SessionWithOneCheckedInAttendee: State = {
  sessions: [sessionWithOneCheckedInAttendee],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

type MockStoreProps = {
  sessionState: State;
  children: ReactElement;
};

const Mockstore = ({ sessionState, children }: MockStoreProps) => {
  return (
    <Provider
      store={configureStore({
        reducer: {
          sessions: createSlice({
            name: "sessions",
            initialState: sessionState,
            reducers: {},
            extraReducers(builder) {
              builder
                .addCase(sessionCheckin.fulfilled, (state, action) => {
                  state.status = SessionStatus.CHECKIN_IN_SUCCEEDED;
                })
                .addCase(sessionCheckin.rejected, (state, action) => {
                  state.status = SessionStatus.CHECKIN_IN_FAILED;
                  state.error = action.payload as ErrorMessage[];
                })
                .addCase(sessionCheckout.fulfilled, (state, action) => {
                  state.status = SessionStatus.CHECKOUT_SUCCEEDED;
                })
                .addCase(sessionCancel.fulfilled, (state, action) => {
                  state.status = SessionStatus.CANCEL_SUCCEEDED;
                });
            },
          }).reducer,
          login: createSlice({
            name: "login",
            initialState: {
              token: { token: "token", type: "bearer" },
              status: AuthStatus.SUCCEEDED,
              error: [],
            },
            reducers: {},
            extraReducers: {},
          }).reducer,
        },
      })}
    >
      {children}
    </Provider>
  );
};

export default {
  component: SessionDetails,
  title: "Session Details",
  decorators: [
    (story: any) => (
      <Provider store={store}>
        <SnackbarProvider>{story()}</SnackbarProvider>
      </Provider>
    ),
  ],
  excludeStories: /.*MockedState$/,
  parameters: {
    docs: {
      page: SessionDetailsDoc,
    },
  },
};

const Template: ComponentStory<typeof SessionDetails> = (args) => (
  <SessionDetails {...args} />
);

export const DisplaySessionDetails = Template.bind({});
export const SessionCheckin = Template.bind({});
export const SessionCheckinError = Template.bind({});
export const SessionCheckout = Template.bind({
  session: sessionWithOneCheckedInAttendee,
});
export const SessionCheckoutError = Template.bind({
  session: sessionWithOneCheckedInAttendee,
});
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
  (story: any) => (
    <Mockstore sessionState={SessionWithTwoAttendees}>{story()}</Mockstore>
  ),
];
DisplaySessionDetails.args = {
  session: sessionWithTwoAttendees,
};
DisplaySessionDetails.parameters = {
  msw: {
    handlers: [],
  },
};

DisplaySessionDetails.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  await expect(canvas.getByText("Bruno Germain")).toBeInTheDocument();
  await expect(canvas.getByText("4")).toBeInTheDocument();
  await expect(canvas.getByText("C")).toBeInTheDocument();
  await expect(canvas.getByText("Bertrand Bougon")).toBeInTheDocument();
  await expect(canvas.getByText("5")).toBeInTheDocument();
  await expect(canvas.getByText("R")).toBeInTheDocument();
};

/*
    #########################################################
    # Perform checkin                                       #
    #########################################################
 */
SessionCheckin.decorators = [
  (story: any) => (
    <Mockstore sessionState={SessionWithOneRegisteredAttendee}>
      {story()}
    </Mockstore>
  ),
];
SessionCheckin.storyName = "Bruno Germain performs checkin";
SessionCheckin.args = {
  session: defaultSession,
};
SessionCheckin.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/checkin", (req, res, _) => {
        const response = checkinResponse(
          defaultSession.id ?? "1",
          defaultSession.classroomId,
          new ApiSessionsBuilder()
            .withId(defaultSession.id!)
            .withClassroom(defaultSession.classroomId)
            .withName(defaultSession.name)
            .withSchedule(
              new ScheduleBuilder(defaultSession.schedule.start).build()
            )
            .withPosition(defaultSession.position)
            .withAttendees([
              new ApiAttendeeBuilder()
                .withId("1")
                .withFirstname("Bruno")
                .withLastname("Germain")
                .checkedIn()
                .with_credits(4)
                .build(),
            ])
            .build()
        );
        return res(compose(context.status(201), context.json(response)));
      }),
    ],
  },
};

SessionCheckin.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));

  await userEvent.click(canvas.getByRole("checkbox"));
  await sleep(100);

  await expect(canvas.getByText("4")).toBeInTheDocument();
  await expect(canvas.getByText("C")).toBeInTheDocument();

  await waitFor(async () => {
    await fireEvent.click(canvas.getByRole("button", { name: /more/i }));
  });

  const presentation = within(screen.getByRole("presentation"));
  await expect(
    presentation.getByRole("menuitem", { name: /cancel/i })
  ).toHaveAttribute("aria-disabled");
};

SessionCheckinError.decorators = [
  (story: any) => (
    <Mockstore sessionState={SessionWithOneRegisteredAttendee}>
      {story()}
    </Mockstore>
  ),
];
SessionCheckinError.storyName = "Bruno Germain could not checkin";
SessionCheckinError.args = {
  session: defaultSession,
};
SessionCheckinError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/checkin", (req, res, _) => {
        return res(compose(context.status(400), context.json(error)));
      }),
    ],
  },
};

SessionCheckinError.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));

  await userEvent.click(canvas.getByRole("checkbox"));
  await sleep(100);

  await expect(
    canvas.getByText("Error occurred - Checkin could not be completed")
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Perform Checkout                                      #
    #########################################################
 */
SessionCheckout.decorators = [
  (story: any) => (
    <Mockstore sessionState={SessionWithOneCheckedInAttendee}>
      {story()}
    </Mockstore>
  ),
];
SessionCheckout.storyName = "Bruno Germain performs checkout";
SessionCheckout.args = {
  session: sessionWithOneCheckedInAttendee,
};
SessionCheckout.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/2/checkout", (req, res, _) => {
        const response = checkinResponse(
          sessionWithOneCheckedInAttendee.id ?? "1",
          sessionWithOneCheckedInAttendee.classroomId,
          new ApiSessionsBuilder()
            .withId(sessionWithOneCheckedInAttendee.id!)
            .withClassroom(sessionWithOneCheckedInAttendee.classroomId)
            .withName(sessionWithOneCheckedInAttendee.name)
            .withSchedule(
              new ScheduleBuilder(
                sessionWithOneCheckedInAttendee.schedule.start
              ).build()
            )
            .withPosition(sessionWithOneCheckedInAttendee.position)
            .withAttendees([
              new ApiAttendeeBuilder()
                .withId("1")
                .withFirstname("Bruno")
                .withLastname("Germain")
                .with_credits(5)
                .build(),
            ])
            .build()
        );
        return res(compose(context.status(201), context.json(response)));
      }),
    ],
  },
};

SessionCheckout.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));
  await expect(canvas.getByText("4")).toBeInTheDocument();
  await expect(canvas.getByText("C")).toBeInTheDocument();

  await userEvent.click(canvas.getByRole("checkbox"));
  await sleep(200);

  await expect(canvas.getByText("5")).toBeInTheDocument();
  await expect(canvas.getByText("R")).toBeInTheDocument();

  await waitFor(async () => {
    await fireEvent.click(canvas.getByRole("button", { name: /more/i }));
  });

  const presentation = within(screen.getByRole("presentation"));
  await expect(
    presentation.getByRole("menuitem", { name: /cancel/i })
  ).not.toHaveAttribute("aria-disabled");
};

SessionCheckoutError.decorators = [
  (story: any) => (
    <Mockstore sessionState={SessionWithOneCheckedInAttendee}>
      {story()}
    </Mockstore>
  ),
];
SessionCheckoutError.storyName = "Bruno Germain cannot checkout";
SessionCheckoutError.args = {
  session: sessionWithOneCheckedInAttendee,
};
SessionCheckoutError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/2/checkout", (req, res, _) => {
        return res(compose(context.status(400), context.json(error)));
      }),
    ],
  },
};

SessionCheckoutError.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));
  await expect(canvas.getByText("4")).toBeInTheDocument();
  await expect(canvas.getByText("C")).toBeInTheDocument();

  await userEvent.click(canvas.getByRole("checkbox"));
  await sleep(200);

  await expect(
    canvas.getByText("Error occurred - Checkout could not be completed")
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Cancel session                                        #
    #########################################################
 */
CancelSession.decorators = [
  (story: any) => (
    <Mockstore sessionState={SessionWithOneRegisteredAttendee}>
      {story()}
    </Mockstore>
  ),
];
CancelSession.storyName = "Bruno Germain cancel his session";
CancelSession.args = {
  session: defaultSession,
};
CancelSession.parameters = {
  msw: {
    handlers: [
      rest.post(
        "http://localhost:8081/sessions/cancellation/1",
        (req, res, _) => {
          const response = cancellationResponse(
            defaultSession.id ?? "1",
            defaultSession.classroomId,
            new ApiSessionsBuilder()
              .withId(defaultSession.id!)
              .withClassroom(defaultSession.classroomId)
              .withName(defaultSession.name)
              .withSchedule(
                new ScheduleBuilder(defaultSession.schedule.start).build()
              )
              .withPosition(defaultSession.position)
              .withAttendees(undefined)
              .build()
          );
          return res(compose(context.status(201), context.json(response)));
        }
      ),
    ],
  },
};

CancelSession.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));

  await expect(canvas.getByText("Bruno Germain")).toBeInTheDocument();

  await waitFor(async () => {
    await fireEvent.click(canvas.getByRole("button", { name: /more/i }));
  });

  const presentation = within(screen.getByRole("presentation"));
  await waitFor(async () => {
    await fireEvent.click(
      presentation.getByRole("menuitem", { name: /cancel/i })
    );
  });
  await sleep(200);

  expect(canvas.queryByText("Bruno Germain")).not.toBeInTheDocument();
};
