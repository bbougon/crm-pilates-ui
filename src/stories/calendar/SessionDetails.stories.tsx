import React, { ReactElement } from "react";
import {
  ApiAttendeeBuilder,
  ApiSessionBuilder,
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
  SessionState,
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
import { SessionDetails } from "../../component/calendar/SessionDetails";
import SessionDetailsDoc from "./SessionDetails.docs.mdx";
import { ErrorMessage } from "../../features/errors";
import { SnackbarProvider } from "../../context/SnackbarProvider";
import { ClientState, ClientStatus } from "../../features/clientsSlice";
import { ClientsBuilder } from "../../test-utils/clients/clients";
import { Client } from "../../features/domain/client";

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

const emptySession: Session = new SessionBuilder()
  .withId("1")
  .withPosition(2)
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

const EmptySessionState: SessionState = {
  sessions: [emptySession],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const SessionWithTwoAttendees: SessionState = {
  sessions: [sessionWithTwoAttendees],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const SessionWithOneRegisteredAttendee: SessionState = {
  sessions: [defaultSession],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const SessionWithOneCheckedInAttendee: SessionState = {
  sessions: [sessionWithOneCheckedInAttendee],
  status: SessionStatus.IDLE,
  error: [],
  link: undefined,
};

const EmptyClientState: ClientState = {
  clients: [],
  error: [],
  status: ClientStatus.IDLE,
};

const clients = new ClientsBuilder().for(5).build() as Client[];

const ClientStateWithFiveClients: ClientState = {
  clients: clients,
  error: [],
  status: ClientStatus.SUCCEEDED,
};

const twoAttendeesFromClientList = new AttendeesBuilder()
  .withAttendee(
    new AttendeeBuilder()
      .id(clients[0].id)
      .firstname(clients[0].firstname)
      .lastname(clients[0].lastname)
      .build()
  )
  .withAttendee(
    new AttendeeBuilder()
      .id(clients[1].id)
      .firstname(clients[1].firstname)
      .lastname(clients[1].lastname)
      .build()
  )
  .build();

const sessionWithTwoAttendeesFromClientList: Session = new SessionBuilder()
  .withAttendees(twoAttendeesFromClientList)
  .build();

const SessionStateWithTwoAttendeesFromClientList: SessionState = {
  error: [],
  link: undefined,
  sessions: [sessionWithTwoAttendeesFromClientList],
  status: SessionStatus.IDLE,
};

type MockStoreProps = {
  sessionState: SessionState;
  clientState: ClientState;
  children: ReactElement;
};

const Mockstore = ({ sessionState, clientState, children }: MockStoreProps) => {
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
          clients: createSlice({
            name: "clients",
            initialState: clientState,
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
export const CancelSessionError = Template.bind({});

export const AddAttendeeToSession = Template.bind({});
export const AddAttendeeToSessionCleanClientList = Template.bind({});
export const AddAttendeeToSessionError = Template.bind({});

const getMockstore = ({
  story,
  sessionState = SessionWithOneRegisteredAttendee,
  clientState = EmptyClientState,
}: {
  story: any;
  sessionState?: SessionState;
  clientState?: ClientState;
}) => {
  return (
    <Mockstore sessionState={sessionState} clientState={clientState}>
      {story()}
    </Mockstore>
  );
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
    #########################################################
    # Display default session details                       #
    #########################################################
 */

DisplaySessionDetails.decorators = [
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithTwoAttendees }),
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
  await expect(canvas.getByLabelText("add")).toBeDisabled();
};

/*
    #########################################################
    # Perform checkin                                       #
    #########################################################
 */
SessionCheckin.decorators = [
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithOneRegisteredAttendee }),
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
          new ApiSessionBuilder()
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
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithOneRegisteredAttendee }),
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
    canvas.getByText("Session checkin - Error occurred")
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Perform Checkout                                      #
    #########################################################
 */
SessionCheckout.decorators = [
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithOneCheckedInAttendee }),
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
          new ApiSessionBuilder()
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
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithOneCheckedInAttendee }),
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
    canvas.getByText("Session checkout - Error occurred")
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Cancel session                                        #
    #########################################################
 */
CancelSession.decorators = [
  (story: any) =>
    getMockstore({ story, sessionState: SessionWithOneRegisteredAttendee }),
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
            new ApiSessionBuilder()
              .withId(defaultSession.id!)
              .withClassroom(defaultSession.classroomId)
              .withName(defaultSession.name)
              .withSchedule(
                new ScheduleBuilder(defaultSession.schedule.start).build()
              )
              .withPosition(defaultSession.position)
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

CancelSessionError.decorators = [(story: any) => getMockstore({ story })];
CancelSessionError.storyName = "Bruno Germain cannot cancel his session";
CancelSessionError.args = {
  session: defaultSession,
};
CancelSessionError.parameters = {
  msw: {
    handlers: [
      rest.post(
        "http://localhost:8081/sessions/cancellation/1",
        (req, res, _) => {
          return res(compose(context.status(400), context.json(error)));
        }
      ),
    ],
  },
};

CancelSessionError.play = async ({ canvasElement }) => {
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

  expect(canvas.queryByText("Bruno Germain")).toBeInTheDocument();
  await expect(
    canvas.getByText("Session cancellation - Error occurred")
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Add Attendees                                         #
    #########################################################
 */

const clickOnAutoComplete = (canvas: any) => {
  userEvent.click(canvas.getByRole("combobox"));
  return within(screen.getByRole("presentation")).getByRole("listbox");
};

AddAttendeeToSession.decorators = [
  (story: any) =>
    getMockstore({
      story,
      sessionState: EmptySessionState,
      clientState: ClientStateWithFiveClients,
    }),
];
AddAttendeeToSession.storyName = "Can add attendees";
AddAttendeeToSession.args = {
  session: emptySession,
};

AddAttendeeToSession.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/attendees", (req, res, _) => {
        const attendees = [
          new ApiAttendeeBuilder()
            .withFirstname(clients[0].firstname)
            .withLastname(clients[0].lastname)
            .with_credits(5)
            .build(),
          new ApiAttendeeBuilder()
            .withFirstname(clients[3].firstname)
            .withLastname(clients[3].lastname)
            .with_credits(5)
            .build(),
        ];
        const apiSession = new ApiSessionBuilder()
          .withId(sessionWithOneCheckedInAttendee.id!)
          .withClassroom(sessionWithOneCheckedInAttendee.classroomId)
          .withName(sessionWithOneCheckedInAttendee.name)
          .withSchedule(
            new ScheduleBuilder(
              sessionWithOneCheckedInAttendee.schedule.start
            ).build()
          )
          .withPosition(sessionWithOneCheckedInAttendee.position)
          .withAttendees(attendees)
          .build();
        return res(compose(context.status(200), context.json(apiSession)));
      }),
    ],
  },
};

AddAttendeeToSession.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));
  userEvent.click(canvas.getByTestId("AddBoxIcon"));
  await expect(canvas.getByLabelText("add")).toBeDisabled();

  userEvent.click(
    within(clickOnAutoComplete(canvas)).getByText(
      clients[0].lastname + " " + clients[0].firstname
    )
  );
  userEvent.click(
    within(clickOnAutoComplete(canvas)).getByText(
      clients[3].lastname + " " + clients[3].firstname
    )
  );

  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  await sleep(100);

  expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
  await expect(
    canvas.getByText(clients[0].firstname + " " + clients[0].lastname)
  ).toBeInTheDocument();
  await expect(canvas.getAllByText("0")).toHaveLength(2);
  await expect(canvas.getAllByText("R")).toHaveLength(2);
  await expect(
    canvas.getByText(clients[3].firstname + " " + clients[3].lastname)
  ).toBeInTheDocument();
};

AddAttendeeToSessionCleanClientList.decorators = [
  (story: any) =>
    getMockstore({
      story,
      sessionState: SessionStateWithTwoAttendeesFromClientList,
      clientState: ClientStateWithFiveClients,
    }),
];
AddAttendeeToSessionCleanClientList.storyName = "Filter clients from attendees";
AddAttendeeToSessionCleanClientList.args = {
  session: sessionWithTwoAttendeesFromClientList,
};

AddAttendeeToSessionCleanClientList.parameters = {
  msw: {
    handlers: [],
  },
};

AddAttendeeToSessionCleanClientList.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));
  userEvent.click(canvas.getByTestId("AddBoxIcon"));
  await expect(canvas.getByLabelText("add")).toBeDisabled();

  const clientList = clickOnAutoComplete(canvas);

  expect(
    within(clientList).queryByText(
      twoAttendeesFromClientList[0].lastname +
        " " +
        twoAttendeesFromClientList[0].firstname
    )
  ).not.toBeInTheDocument();
  expect(
    within(clientList).queryByText(
      twoAttendeesFromClientList[1].lastname +
        " " +
        twoAttendeesFromClientList[1].firstname
    )
  ).not.toBeInTheDocument();
};

AddAttendeeToSessionError.decorators = [
  (story: any) =>
    getMockstore({
      story,
      sessionState: EmptySessionState,
      clientState: ClientStateWithFiveClients,
    }),
];
AddAttendeeToSessionError.storyName = "Display snackbar on errors";
AddAttendeeToSessionError.args = {
  session: emptySession,
};
AddAttendeeToSessionError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/sessions/attendees", (req, res, _) => {
        return res(compose(context.status(422), context.json(error)));
      }),
    ],
  },
};

AddAttendeeToSessionError.play = async ({ canvasElement }) => {
  const canvas = await waitFor(() => within(canvasElement));
  userEvent.click(canvas.getByTestId("AddBoxIcon"));
  await expect(canvas.getByLabelText("add")).toBeDisabled();

  userEvent.click(
    within(clickOnAutoComplete(canvas)).getByText(
      clients[0].lastname + " " + clients[0].firstname
    )
  );
  userEvent.click(
    within(clickOnAutoComplete(canvas)).getByText(
      clients[3].lastname + " " + clients[3].firstname
    )
  );

  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  await sleep(100);

  await expect(
    canvas.getByText("Add attendee to classroom - Error occurred")
  ).toBeInTheDocument();
};
