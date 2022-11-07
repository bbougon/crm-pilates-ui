import React, { ReactElement } from "react";
import { Session } from "../../features/domain/session";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import {
  SessionState,
  SessionStatus,
  fetchSessions,
} from "../../features/sessionsSlice";
import { store } from "../../app/store";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentStory } from "@storybook/react";
import { AuthState, AuthStatus, login } from "../../features/auth";
import { SnackbarProvider } from "../../context/SnackbarProvider";
import Calendar from "../../component/calendar/Calendar";
import AuthDoc from "./Auth.docs.mdx";
import { add, parseISO } from "date-fns";
import {
  ClientState,
  ClientStatus,
  fetchClients,
} from "../../features/clientsSlice";
import { compose, context, rest } from "msw";
import {
  ApiSessionBuilder,
  RecurrentSessionsBuilder,
  ScheduleBuilder,
  SessionBuilder,
} from "../../test-utils/classroom/session";
import Login from "../../component/login/Login";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "../../component/home";
import { screen } from "@testing-library/react";
import { AddNewClientOnError } from "../clients/ClientForm.stories";
import sign from "jwt-encode";

const error = { detail: [{ msg: "Error occurred", type: "Error" }] };

type MockStoreProps = {
  authState: AuthState;
  children: ReactElement;
};

const initialState: AuthState = {
  token: { token: "token", type: "bearer" },
  status: AuthStatus.IDLE,
  error: [],
};

const MockStore = ({ authState, children }: MockStoreProps) => {
  return (
    <Provider
      store={configureStore({
        reducer: {
          login: createSlice({
            name: "login",
            initialState: authState,
            reducers: {},
            extraReducers(builder) {
              builder.addCase(login.fulfilled, (state, _) => {
                state.status = AuthStatus.SUCCEEDED;
              });
            },
          }).reducer,
        },
      })}
    >
      {children}
    </Provider>
  );
};

export default {
  component: Login,
  title: "Auth",
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
      page: AuthDoc,
    },
  },
};

const Template: ComponentStory<typeof BrowserRouter> = (_) => (
  <BrowserRouter>
    <Link to="/">Home</Link>
    <Link to="/login">Login</Link>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route exact path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export const AuthDefault = Template.bind({});
export const AuthLogin = Template.bind({});
export const AuthError = Template.bind({});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
    #########################################################
    # Display default login form                            #
    #########################################################
 */

AuthDefault.decorators = [
  (story: any) => <MockStore authState={initialState}>{story()}</MockStore>,
];
AuthDefault.storyName = "Should display login form";

AuthDefault.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);
  await userEvent.click(screen.getByRole("link", { name: /login/i }));

  expect(await canvas.findByLabelText("Username")).toBeInTheDocument();
  expect(await canvas.findByLabelText("Password")).toBeInTheDocument();
  expect(await canvas.findByRole("button", { name: /login/i })).toBeEnabled();
};

/*
    #########################################################
    # Should login                                          #
    #########################################################
 */

const token = sign(
  { exp: add(new Date(), { minutes: 2 }).getTime() },
  "secret"
);

AuthLogin.decorators = [
  (story: any) => <MockStore authState={initialState}>{story()}</MockStore>,
];
AuthLogin.storyName = "Should login";
AuthLogin.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/token", (req, res, _) => {
        return res(
          compose(context.status(201), context.json({ token, type: "bearer" }))
        );
      }),
    ],
  },
};

AuthLogin.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);
  await userEvent.click(screen.getByRole("link", { name: /login/i }));

  userEvent.type(
    within(await canvas.findByLabelText("Username")).getByRole("textbox"),
    "login"
  );
  userEvent.type(canvas.getByPlaceholderText("Password"), "password");
  userEvent.click(await canvas.findByRole("button", { name: /login/i }));

  expect(
    await waitFor(() => screen.getByText("Welcome Home"))
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Display a snackbar on error                           #
    #########################################################
 */

AuthError.decorators = [
  (story: any) => <MockStore authState={initialState}>{story()}</MockStore>,
];
AuthError.storyName = "Should display snackbar on error";
AuthError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/token", (req, res, _) => {
        return res(compose(context.status(422), context.json(error)));
      }),
    ],
  },
};

AuthError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);
  await userEvent.click(screen.getByRole("link", { name: /login/i }));

  userEvent.type(
    within(await canvas.findByLabelText("Username")).getByRole("textbox"),
    "login"
  );
  userEvent.type(canvas.getByPlaceholderText("Password"), "password");
  userEvent.click(await canvas.findByRole("button", { name: /login/i }));
  await sleep(100);

  expect(
    await waitFor(() =>
      screen.getByText("Authentication failed - Error occurred")
    )
  ).toBeInTheDocument();
};
