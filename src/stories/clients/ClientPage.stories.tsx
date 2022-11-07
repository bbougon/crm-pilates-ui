import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { store } from "../../app/store";
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
import { SnackbarProvider } from "../../context/SnackbarProvider";
import ClientPageDoc from "./ClientPage.docs.mdx";
import {
  ClientState,
  ClientStatus,
  createClient,
  fetchClients,
} from "../../features/clientsSlice";
import { compose, context, rest } from "msw";
import {
  ApiClientBuilder,
  ClientCreditsBuilder,
  ClientsBuilder,
} from "../../test-utils/clients/clients";
import { Subjects } from "../../features/domain/subjects";
import ClientPage from "../../component/clients/ClientPage";
import { translate } from "../../utils/translation";

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
              builder.addCase(createClient.fulfilled, (state, action) => {
                state.status = ClientStatus.SUCCEEDED;
                state.clients.push(action.payload);
              });
              builder.addCase(createClient.rejected, (state, _) => {
                state.status = ClientStatus.CREATION_FAILED;
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
  component: ClientPage,
  title: "Client Page",
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
      page: ClientPageDoc,
    },
  },
};

const Template: ComponentStory<typeof ClientPage> = () => <ClientPage />;

export const ClientPageDefault = Template.bind({});
export const ClientPageAddNewClient = Template.bind({});

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
    # Display the client page                               #
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

ClientPageDefault.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientPageDefault.storyName = "Should display the client page";
ClientPageDefault.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(threeClients)));
      }),
    ],
  },
};

ClientPageDefault.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getByTestId("ExpandMoreIcon"));
  expect(canvas.getByLabelText("Client lastname")).toBeInTheDocument();
  expect(canvas.getByLabelText("Client firstname")).toBeInTheDocument();
  expect(canvas.getByRole("button", { name: "add" })).toBeInTheDocument();
  expect(canvas.getByRole("button", { name: /submit/i })).toBeDisabled();
  await sleep(100);
  expect(await waitFor(() => canvas.getAllByTestId("PersonIcon"))).toHaveLength(
    3
  );
};

/*
    #########################################################
    # Add a new client                                      #
    #########################################################
 */
const credits = new ClientCreditsBuilder().all().build();
const oneClientWithCredits = new ApiClientBuilder()
  .withCredits(credits)
  .build();

ClientPageAddNewClient.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientPageAddNewClient.storyName =
  "Should add a new client and update client list";
ClientPageAddNewClient.parameters = {
  msw: {
    handlers: [
      rest.get("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(threeClients)));
      }),
      rest.post("http://localhost:8081/clients", (req, res, _) => {
        return res(
          compose(context.status(200), context.json(oneClientWithCredits))
        );
      }),
    ],
  },
};

ClientPageAddNewClient.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getAllByTestId("ExpandMoreIcon")[0]);
  const clientLastnameElement = within(
    await canvas.findByLabelText("Client lastname")
  ).getByRole("textbox");
  userEvent.clear(clientLastnameElement);
  userEvent.type(clientLastnameElement, oneClientWithCredits.lastname);
  const clientFirstnameElement = within(
    await canvas.findByLabelText("Client firstname")
  ).getByRole("textbox");
  userEvent.clear(clientFirstnameElement);
  userEvent.type(clientFirstnameElement, oneClientWithCredits.firstname);
  for (const credit of credits) {
    userEvent.click(canvas.getByRole("button", { name: "add" }));
    expect(canvas.getByRole("button", { name: "add" })).toBeDisabled();
    fireEvent.mouseDown(canvas.getByRole("button", { name: /subject/i }));
    const subjects = await screen.findByRole("listbox");
    userEvent.click(
      within(subjects).getByText(translate(credit.subject as Subjects)!)
    );
    userEvent.type(canvas.getByRole("spinbutton"), credit.value.toString());
    userEvent.click(canvas.getByRole("button", { name: /add credits/i }));
  }
  userEvent.click(canvas.getByRole("button", { name: /submit/i }));

  expect(
    await waitFor(() => canvas.getByText(oneClientWithCredits.firstname))
  ).toBeInTheDocument();
  expect(
    await waitFor(() => canvas.getByText(oneClientWithCredits.lastname))
  ).toBeInTheDocument();
};
