import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { store } from "../../app/store";
import { waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentStory } from "@storybook/react";
import { AuthStatus } from "../../features/auth";
import { SnackbarProvider } from "../../context/SnackbarProvider";
import ClientListDoc from "./ClientList.docs.mdx";
import {
  ClientState,
  ClientStatus,
  fetchClients,
} from "../../features/clientsSlice";
import { compose, context, rest } from "msw";
import { ClientsList } from "../../component/clients/ClientsList";
import {
  ApiClientBuilder,
  ClientsBuilder,
} from "../../test-utils/clients/clients";

const error = { detail: [{ msg: "Error occurred", type: "Error" }] };

type MockStoreProps = {
  clientState: ClientState;
  children: ReactElement;
};

const MockStore = ({ clientState, children }: MockStoreProps) => {
  return (
    <Provider
      store={configureStore({
        reducer: {
          clients: createSlice({
            name: "clients",
            initialState: clientState,
            reducers: {},
            extraReducers(builder) {
              builder.addCase(fetchClients.fulfilled, (state, action) => {
                state.status = ClientStatus.SUCCEEDED;
                state.clients = action.payload.clients;
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
  component: ClientsList,
  title: "Client List",
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
      page: ClientListDoc,
    },
  },
};

const Template: ComponentStory<typeof ClientsList> = () => <ClientsList />;

export const ClientListDefault = Template.bind({});
export const ClientListOnError = Template.bind({});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultClientState: ClientState = {
  clients: [],
  error: [],
  status: ClientStatus.IDLE,
};

/*
    #########################################################
    # Display a list of clients                             #
    #########################################################
 */

const firstClient = new ApiClientBuilder().build();
const secondClient = new ApiClientBuilder().build();
const thirdClient = new ApiClientBuilder().build();
const threeClients = new ClientsBuilder()
  .withClient(firstClient)
  .withClient(secondClient)
  .withClient(thirdClient)
  .build();

ClientListDefault.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientListDefault.storyName = "Should display a list of clients";
ClientListDefault.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(threeClients)));
      }),
    ],
  },
};

ClientListDefault.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  expect(await waitFor(() => canvas.getAllByTestId("PersonIcon"))).toHaveLength(
    3
  );
  expect(
    await waitFor(() => canvas.getByText(firstClient.firstname))
  ).toBeInTheDocument();
  expect(
    await waitFor(() => canvas.getByText(firstClient.lastname))
  ).toBeInTheDocument();
};

/*
    #########################################################
    # Display error loading                                 #
    #########################################################
 */

ClientListOnError.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientListOnError.storyName =
  "Should display a snack bar when clients cannot be loaded";
ClientListOnError.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(400), context.json(error)));
      }),
    ],
  },
};

ClientListOnError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  expect(
    await waitFor(() => canvas.getByText("Retrieving clients - Error occurred"))
  ).toBeInTheDocument();
};
