import React, { ReactElement } from "react";
import { Session } from "../../features/domain/session";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { SessionStatus, fetchSessions } from "../../features/sessionsSlice";
import { store } from "../../app/store";
import { within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentStory } from "@storybook/react";
import { AuthStatus } from "../../features/auth";
import { ErrorMessage } from "../../features/errors";
import { SnackbarProvider } from "../../context/SnackbarProvider";
import Calendar from "../../component/calendar/Calendar";
import CalendarDoc from "./Calendar.docs.mdx";
import { parseISO } from "date-fns";
import { Client } from "../../features/domain/client";
import { ClientStatus, fetchClients } from "../../features/clientsSlice";
import { waitFor } from "@testing-library/react";
import { compose, context, rest } from "msw";

type SessionState = {
  sessions: Session[];
  status: SessionStatus;
  error: ErrorMessage[];
  link: string | undefined;
};

type ClientState = {
  clients: Client[];
  status:
    | ClientStatus.IDLE
    | ClientStatus.LOADING
    | ClientStatus.SUCCEEDED
    | ClientStatus.FAILED
    | ClientStatus.CREATION_FAILED;
  error: ErrorMessage[];
};

const error = { detail: [{ msg: "Error occurred", type: "Error" }] };

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
                .addCase(fetchSessions.fulfilled, (state, action) => {
                  state.status = SessionStatus.SUCCEEDED;
                })
                .addCase(fetchSessions.rejected, (state, action) => {
                  state.status = SessionStatus.FAILED;
                });
            },
          }).reducer,
          clients: createSlice({
            name: "clients",
            initialState: clientState,
            reducers: {},
            extraReducers(builder) {
              builder.addCase(fetchClients.fulfilled, (state, action) => {
                state.status = ClientStatus.SUCCEEDED;
              });
              builder.addCase(fetchClients.rejected, (state, action) => {
                state.status = ClientStatus.FAILED;
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
  component: Calendar,
  title: "Calendar",
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
      page: CalendarDoc,
    },
  },
};

const Template: ComponentStory<typeof Calendar> = (args) => (
  <Calendar {...args} />
);

export const CalendarDefault = Template.bind({});
export const CalendarDefaultOnSessionFetchingError = Template.bind({});
export const CalendarDefaultOnClientsFetchingError = Template.bind({});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
    #########################################################
    # Display default session details                       #
    #########################################################
 */
const defaultSessionState: SessionState = {
  error: [],
  link: undefined,
  sessions: [],
  status: SessionStatus.IDLE,
};

const defaultClientState: ClientState = {
  clients: [],
  error: [],
  status: ClientStatus.IDLE,
};

/*
    #########################################################
    # Display default empty calendar                        #
    #########################################################
 */

CalendarDefault.decorators = [
  (story: any) => (
    <Mockstore
      sessionState={defaultSessionState}
      clientState={defaultClientState}
    >
      {story()}
    </Mockstore>
  ),
];
CalendarDefault.args = {
  date: parseISO("2019-10-10T11:20:00"),
};
CalendarDefault.storyName =
  "Should display calendar with a button to add classroom for each days";
CalendarDefault.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/sessions", (req, res, _) => {
        return res(compose(context.status(200), context.json([])));
      }),
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json([])));
      }),
    ],
  },
};

CalendarDefault.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  expect(await waitFor(() => canvas.getAllByTestId("AddIcon"))).toHaveLength(
    27
  );
};

CalendarDefaultOnSessionFetchingError.decorators = [
  (story: any) => (
    <Mockstore
      sessionState={defaultSessionState}
      clientState={defaultClientState}
    >
      {story()}
    </Mockstore>
  ),
];
CalendarDefaultOnSessionFetchingError.args = {
  date: parseISO("2019-10-10T11:20:00"),
};
CalendarDefaultOnSessionFetchingError.storyName =
  "Should display a snackbar when sessions cannot be loaded";
CalendarDefaultOnSessionFetchingError.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/sessions", (req, res, _) => {
        return res(compose(context.status(400), context.json(error)));
      }),
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json([])));
      }),
    ],
  },
};

CalendarDefaultOnSessionFetchingError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  expect(
    await waitFor(() =>
      canvas.getByText("Error occurred - Sessions could not be retrieved")
    )
  ).toBeInTheDocument();
};

CalendarDefaultOnClientsFetchingError.decorators = [
  (story: any) => (
    <Mockstore
      sessionState={defaultSessionState}
      clientState={defaultClientState}
    >
      {story()}
    </Mockstore>
  ),
];
CalendarDefaultOnClientsFetchingError.args = {
  date: parseISO("2019-10-10T11:20:00"),
};
CalendarDefaultOnClientsFetchingError.storyName =
  "Should display a snackbar when clients cannot be loaded";
CalendarDefaultOnClientsFetchingError.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/sessions", (req, res, _) => {
        return res(compose(context.status(200), context.json([])));
      }),
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(400), context.json(error)));
      }),
    ],
  },
};

CalendarDefaultOnClientsFetchingError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  expect(
    await waitFor(() =>
      canvas.getByText("Error occurred - Clients could not be retrieved")
    )
  ).toBeInTheDocument();
};
