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
import ClientFormDoc from "./ClientForm.docs.mdx";
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
} from "../../test-utils/clients/clients";
import { AddClientForm } from "../../component/onboarding/ClientForm";
import { Subjects } from "../../features/domain/subjects";

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
              builder.addCase(createClient.fulfilled, (state, _) => {
                state.status = ClientStatus.SUCCEEDED;
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
  component: AddClientForm,
  title: "Add Client Form",
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
      page: ClientFormDoc,
    },
  },
};

const Template: ComponentStory<typeof AddClientForm> = () => <AddClientForm />;

export const ClientFormDefault = Template.bind({});
export const AddNewClient = Template.bind({});
export const AddNewClientWithCredits = Template.bind({});
export const AddNewClientOnError = Template.bind({});

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
    # Display the client form                               #
    #########################################################
 */

ClientFormDefault.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
ClientFormDefault.storyName = "Should display the client form";

ClientFormDefault.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getByTestId("ExpandMoreIcon"));
  expect(canvas.getByLabelText("Client lastname")).toBeInTheDocument();
  expect(canvas.getByLabelText("Client firstname")).toBeInTheDocument();
  expect(canvas.getByRole("button", { name: "add" })).toBeInTheDocument();
  expect(canvas.getByRole("button", { name: /submit/i })).toBeDisabled();
};

/*
    #########################################################
    # Add a new client                                      #
    #########################################################
 */
const oneClient = new ApiClientBuilder().build();

AddNewClient.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
AddNewClient.storyName = "Should add a new client";
AddNewClient.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(200), context.json(oneClient)));
      }),
    ],
  },
};

AddNewClient.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getByTestId("ExpandMoreIcon"));
  const clientLastnameElement = within(
    await canvas.findByLabelText("Client lastname")
  ).getByRole("textbox");
  userEvent.clear(clientLastnameElement);
  userEvent.type(clientLastnameElement, oneClient.lastname);
  const clientFirstnameElement = within(
    await canvas.findByLabelText("Client firstname")
  ).getByRole("textbox");
  userEvent.clear(clientFirstnameElement);
  userEvent.type(clientFirstnameElement, oneClient.firstname);
  expect(canvas.getByRole("button", { name: /submit/i })).toBeEnabled();
  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  await sleep(100);
  expect(clientLastnameElement).toHaveValue("");
  expect(clientFirstnameElement).toHaveValue("");
};

/*
    #########################################################
    # Add a new client with credits                         #
    #########################################################
 */
const credits: { value: number; subject: string }[] = new ClientCreditsBuilder()
  .all()
  .build();
const oneClientWithCredits = new ApiClientBuilder()
  .withCredits(credits)
  .build();

AddNewClientWithCredits.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
AddNewClientWithCredits.storyName = "Should add a new client with credits";
AddNewClientWithCredits.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/clients", (req, res, _) => {
        return res(
          compose(context.status(200), context.json(oneClientWithCredits))
        );
      }),
    ],
  },
};

function translate(subject: string): string {
  const translations = [
    { subject: Subjects.MAT, display: "Mat" },
    { subject: Subjects.MACHINE_DUO, display: "Machine Duo" },
    { subject: Subjects.MACHINE_TRIO, display: "Machine Trio" },
    { subject: Subjects.MACHINE_PRIVATE, display: "Machine private" },
  ];
  return translations.find((translation) => translation.subject === subject)!
    .display;
}

AddNewClientWithCredits.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getByTestId("ExpandMoreIcon"));
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
    userEvent.click(within(subjects).getByText(translate(credit.subject)));
    userEvent.type(canvas.getByRole("spinbutton"), credit.value.toString());
    userEvent.click(canvas.getByRole("button", { name: /add credits/i }));
  }
  expect(canvas.getByRole("button", { name: "add" })).toBeDisabled();
  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
};

/*
    #########################################################
    # Add new client on error                               #
    #########################################################
 */
AddNewClientOnError.decorators = [
  (story: any) => (
    <MockStore clientState={defaultClientState}>{story()}</MockStore>
  ),
];
AddNewClientOnError.storyName =
  "Should display a snack bar when new client cannot be created";
AddNewClientOnError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/clients", (req, res, _) => {
        return res(compose(context.status(422), context.json(error)));
      }),
    ],
  },
};

AddNewClientOnError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await sleep(20);

  userEvent.click(canvas.getByTestId("ExpandMoreIcon"));
  const clientLastnameElement = within(
    await canvas.findByLabelText("Client lastname")
  ).getByRole("textbox");
  userEvent.clear(clientLastnameElement);
  userEvent.type(clientLastnameElement, oneClient.lastname);
  const clientFirstnameElement = within(
    await canvas.findByLabelText("Client firstname")
  ).getByRole("textbox");
  userEvent.clear(clientFirstnameElement);
  userEvent.type(clientFirstnameElement, oneClient.firstname);
  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  await sleep(100);

  expect(
    await waitFor(() => canvas.getByText("Client creation - Error occurred"))
  ).toBeInTheDocument();
};
