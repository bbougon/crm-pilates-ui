import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { store } from "../../app/store";
import { screen, userEvent, waitFor, within } from "@storybook/testing-library";
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
import { ClientsList } from "../../component/onboarding/ClientsList";
import {
  ApiClientBuilder,
  ClientsBuilder,
} from "../../test-utils/clients/clients";
import { DialogProvider } from "../../context/DialogProvider";
import { RefreshClientsProvider } from "../../context/RefreshClientsProvider";
import { Client } from "../../features/domain/client";

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
        <DialogProvider>
          <SnackbarProvider>
            <RefreshClientsProvider>{story()}</RefreshClientsProvider>
          </SnackbarProvider>
        </DialogProvider>
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
export const ClientDeletion = Template.bind({});
export const ClientDeletionOnError = Template.bind({});

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

/*
    #########################################################
    # Delete a client                                       #
    #########################################################
 */
const twoClients = new ClientsBuilder()
  .withClient(firstClient)
  .withClient(thirdClient)
  .build();

ClientDeletion.decorators = [
  (story: any) => (
    <MockStore
      clientState={{
        clients: threeClients as Client[],
        error: [],
        status: ClientStatus.SUCCEEDED,
      }}
    >
      {story()}
    </MockStore>
  ),
];
ClientDeletion.storyName = "Should delete client";
ClientDeletion.parameters = {
  msw: {
    handlers: [
      rest.delete(
        `http://localhost:8081/clients/${secondClient.id}`,
        (req, res, _) => {
          return res(compose(context.status(204)));
        }
      ),
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(twoClients)));
      }),
    ],
  },
};

ClientDeletion.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  userEvent.click(canvas.getAllByRole("button")[3]);
  userEvent.click(screen.getByRole("button", { name: "Agree" }));
  await sleep(500);

  expect(
    await waitFor(() => canvas.queryByText(secondClient.lastname))
  ).not.toBeInTheDocument();
};

ClientDeletionOnError.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientDeletionOnError.storyName =
  "Should display a snackbar when client deletion is on error";
ClientDeletionOnError.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(threeClients)));
      }),
      rest.delete(
        `http://localhost:8081/clients/${secondClient.id}`,
        (req, res, _) => {
          return res(compose(context.status(422), context.json(error)));
        }
      ),
    ],
  },
};

ClientDeletionOnError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(100);

  userEvent.click(canvas.getAllByRole("button")[3]);
  userEvent.click(screen.getByRole("button", { name: "Agree" }));
  await sleep(50);

  expect(
    await waitFor(() => canvas.getByText("Deleting client - Error occurred"))
  ).toBeInTheDocument();
};
