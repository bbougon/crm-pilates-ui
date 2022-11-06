import React, { ReactElement } from "react";
import { Session, SessionsLink } from "../../features/domain/session";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { SessionStatus, fetchSessions } from "../../features/sessionsSlice";
import { store } from "../../app/store";
import { screen, userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AuthStatus } from "../../features/auth";
import { ErrorMessage } from "../../features/errors";
import { SnackbarProvider } from "../../context/SnackbarProvider";
import Calendar from "../../component/calendar/Calendar";
import CalendarDoc from "./Calendar.docs.mdx";
import { intlFormat, parseISO } from "date-fns";
import { Client } from "../../features/domain/client";
import { ClientStatus, fetchClients } from "../../features/clientsSlice";
import { waitFor } from "@testing-library/react";
import { compose, context, rest } from "msw";
import {
  ApiSessionBuilder,
  RecurrentSessionsBuilder,
  ScheduleBuilder,
  SessionBuilder,
} from "../../test-utils/classroom/session";

type SessionState = {
  sessions: Session[];
  status: SessionStatus;
  error: ErrorMessage[];
  link: SessionsLink | undefined;
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

const sessions = new RecurrentSessionsBuilder()
  .withSession(
    new SessionBuilder().withSchedule(
      new ScheduleBuilder(parseISO("2019-10-01T10:00:00")).build()
    )
  )
  .every({ period: "WEEKS", for: 5 })
  .build() as [Session];

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
                  state.sessions = action.payload.sessions;
                })
                .addCase(fetchSessions.rejected, (state, _) => {
                  state.status = SessionStatus.FAILED;
                });
            },
          }).reducer,
          clients: createSlice({
            name: "clients",
            initialState: clientState,
            reducers: {},
            extraReducers(builder) {
              builder.addCase(fetchClients.fulfilled, (state, _) => {
                state.status = ClientStatus.SUCCEEDED;
              });
              builder.addCase(fetchClients.rejected, (state, _) => {
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
} as ComponentMeta<typeof Calendar>;

export const Template: ComponentStory<typeof Calendar> = (args) => (
  <Calendar {...args} />
);

// export const CalendarDefault = Template.bind({});
// export const CalendarDefaultOnSessionFetchingError = Template.bind({});
// export const CalendarDefaultOnClientsFetchingError = Template.bind({});
// export const CalendarPeriodChange = Template.bind({});
// export const CalendarAddClassroom = Template.bind({});
//
// function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
//
// /*
//     #########################################################
//     # Display default session details                       #
//     #########################################################
//  */
// const defaultSessionState: SessionState = {
//     error: [],
//     link: undefined,
//     sessions: [],
//     status: SessionStatus.IDLE,
// };
//
// const defaultClientState: ClientState = {
//     clients: [],
//     error: [],
//     status: ClientStatus.IDLE,
// };
//
// /*
//     #########################################################
//     # Display default empty calendar                        #
//     #########################################################
//  */
//
// CalendarDefault.decorators = [
//     (story: any) => (
//         <Mockstore
//             sessionState={{
//                 sessions,
//                 status: SessionStatus.SUCCEEDED,
//                 error: [],
//                 link: undefined,
//             }}
//             clientState={defaultClientState}
//         >
//             {story()}
//         </Mockstore>
//     ),
// ];
// CalendarDefault.args = {
//     date: parseISO("2019-10-10T11:20:00"),
// };
// CalendarDefault.storyName =
//     "Should display calendar with a button to add classroom for each days";
// CalendarDefault.parameters = {
//     msw: {
//         handlers: [
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//             rest.get("http://localhost:8081/clients", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//         ],
//     },
// };
//
// CalendarDefault.play = async ({canvasElement}) => {
//     const canvas = within(canvasElement);
//     await sleep(20);
//
//     expect(await waitFor(() => canvas.getAllByTestId("AddIcon"))).toHaveLength(
//         27
//     );
//     const allDaysOfWeek = await waitFor(() =>
//         canvas.getAllByLabelText("Day of Week")
//     );
//     expect(allDaysOfWeek.map((value) => value.textContent)).toEqual([
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday",
//     ]);
//     expect(await waitFor(() => canvas.getAllByText("Cours tapis"))).toHaveLength(
//         5
//     );
// };
//
// CalendarDefaultOnSessionFetchingError.decorators = [
//     (story: any) => (
//         <Mockstore
//             sessionState={defaultSessionState}
//             clientState={defaultClientState}
//         >
//             {story()}
//         </Mockstore>
//     ),
// ];
// CalendarDefaultOnSessionFetchingError.args = {
//     date: parseISO("2019-10-10T11:20:00"),
// };
// CalendarDefaultOnSessionFetchingError.storyName =
//     "Should display a snackbar when sessions cannot be loaded";
// CalendarDefaultOnSessionFetchingError.parameters = {
//     msw: {
//         handlers: [
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 return res(compose(context.status(400), context.json(error)));
//             }),
//             rest.get("http://localhost:8081/clients", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//         ],
//     },
// };
//
// CalendarDefaultOnSessionFetchingError.play = async ({canvasElement}) => {
//     const canvas = within(canvasElement);
//     await sleep(100);
//
//     expect(
//         await waitFor(() =>
//             canvas.getByText("Error occurred - Sessions could not be retrieved")
//         )
//     ).toBeInTheDocument();
// };
//
// CalendarDefaultOnClientsFetchingError.decorators = [
//     (story: any) => (
//         <Mockstore
//             sessionState={defaultSessionState}
//             clientState={defaultClientState}
//         >
//             {story()}
//         </Mockstore>
//     ),
// ];
// CalendarDefaultOnClientsFetchingError.args = {
//     date: parseISO("2019-10-10T11:20:00"),
// };
// CalendarDefaultOnClientsFetchingError.storyName =
//     "Should display a snackbar when clients cannot be loaded";
// CalendarDefaultOnClientsFetchingError.parameters = {
//     msw: {
//         handlers: [
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//             rest.get("http://localhost:8081/clients", (req, res, _) => {
//                 return res(compose(context.status(400), context.json(error)));
//             }),
//         ],
//     },
// };
//
// CalendarDefaultOnClientsFetchingError.play = async ({canvasElement}) => {
//     const canvas = within(canvasElement);
//     await sleep(100);
//
//     expect(
//         await waitFor(() =>
//             canvas.getByText("Error occurred - Clients could not be retrieved")
//         )
//     ).toBeInTheDocument();
// };
//
// /*
//     #########################################################
//     # Period change                                         #
//     #########################################################
//  */
//
// const apiSessions = new RecurrentSessionsBuilder()
//     .withSession(
//         new ApiSessionBuilder().withSchedule(
//             new ScheduleBuilder(parseISO("2019-09-10T10:00:00")).build()
//         )
//     )
//     .every({period: "WEEKS", for: 2})
//     .build();
//
// CalendarPeriodChange.decorators = [
//     (story: any) => (
//         <Mockstore
//             sessionState={{
//                 sessions,
//                 status: SessionStatus.IDLE,
//                 error: [],
//                 link: {
//                     current: {
//                         url: "/sessions?start_date=2022-10-01T00:00:00+00:00&end_date=2022-10-31T23:59:59+00:00",
//                     },
//                     next: {
//                         url: "/sessions?start_date=2022-11-01T00:00:00+00:00&end_date=2022-11-30T23:59:59+00:00",
//                     },
//                     previous: {
//                         url: "/sessions?start_date=2022-09-01T00:00:00+00:00&end_date=2022-09-30T23:59:59+00:00",
//                     },
//                 },
//             }}
//             clientState={defaultClientState}
//         >
//             {story()}
//         </Mockstore>
//     ),
// ];
// CalendarPeriodChange.args = {
//     date: parseISO("2019-10-10T11:20:00"),
// };
// CalendarPeriodChange.storyName = "Should be able to switch months";
// CalendarPeriodChange.parameters = {
//     msw: {
//         handlers: [
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 return res(
//                     compose(
//                         context.status(200),
//                         context.json(apiSessions),
//                         context.set({
//                             "X-Link":
//                                 '</sessions?start_date=2022-09-01T00%3A00%3A00%2B00%3A00&end_date=2022-09-30T23%3A59%3A59%2B00%3A00>; rel="previous", </sessions?start_date=2022-10-01T00%3A00%3A00%2B00%3A00&end_date=2022-10-31T23%3A59%3A59%2B00%3A00>; rel="current", </sessions?start_date=2022-11-01T00%3A00%3A00%2B00%3A00&end_date=2022-11-30T23%3A59%3A59%2B00%3A00>; rel="next"',
//                         })
//                     )
//                 );
//             }),
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 req.url.searchParams;
//                 return res(
//                     compose(
//                         context.status(200),
//                         context.json(apiSessions),
//                         context.set({
//                             "X-Link":
//                                 '</sessions?start_date=2022-09-01T00%3A00%3A00%2B00%3A00&end_date=2022-09-30T23%3A59%3A59%2B00%3A00>; rel="previous", </sessions?start_date=2022-10-01T00%3A00%3A00%2B00%3A00&end_date=2022-10-31T23%3A59%3A59%2B00%3A00>; rel="current", </sessions?start_date=2022-11-01T00%3A00%3A00%2B00%3A00&end_date=2022-11-30T23%3A59%3A59%2B00%3A00>; rel="next"',
//                         })
//                     )
//                 );
//             }),
//             rest.get("http://localhost:8081/clients", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//         ],
//     },
// };
//
// CalendarPeriodChange.play = async ({canvasElement}) => {
//     const canvas = within(canvasElement);
//     await sleep(20);
//
//     userEvent.click(canvas.getByRole("button", {name: /previous/i}));
//     await sleep(100);
//     expect(await waitFor(() => canvas.getAllByText("Cours tapis"))).toHaveLength(
//         3
//     );
// };
//
// /*
//     #########################################################
//     # Add classroom                                         #
//     #########################################################
//  */
// CalendarAddClassroom.decorators = [
//     (story: any) => (
//         <Mockstore
//             sessionState={defaultSessionState}
//             clientState={defaultClientState}
//         >
//             {story()}
//         </Mockstore>
//     ),
// ];
// CalendarAddClassroom.args = {
//     date: parseISO("2019-10-10T11:20:00"),
// };
// CalendarAddClassroom.storyName =
//     "Should display classroom form";
// CalendarAddClassroom.parameters = {
//     msw: {
//         handlers: [
//             rest.get("http://localhost:8081/sessions", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//             rest.get("http://localhost:8081/clients", (req, res, _) => {
//                 return res(compose(context.status(200), context.json([])));
//             }),
//         ],
//     },
// };
//
// CalendarAddClassroom.play = async ({canvasElement}) => {
//     const canvas = within(canvasElement);
//     await sleep(20);
//
//     const allAddIcons = await waitFor(() => canvas.getAllByTestId("AddIcon"));
//     userEvent.click(allAddIcons[10])
//     await sleep(20);
//     expect(await waitFor(() => screen.getByText(`Scheduling classroom on ${intlFormat(parseISO("2019-10-12T09:00"), {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//     })}`))).toBeInTheDocument();
//     userEvent.click(screen.getByRole("presentation"))
//     expect(await waitFor(() => screen.queryByText(`Scheduling classroom on ${intlFormat(parseISO("2019-10-12T09:00"), {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//     })}`))).not.toBeInTheDocument();
// };
