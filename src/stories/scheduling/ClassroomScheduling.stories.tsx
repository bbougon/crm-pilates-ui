import React, { ReactElement } from "react";
import { intlFormat, parseISO } from "date-fns";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { store } from "../../app/store";
import {
  fireEvent,
  screen,
  userEvent,
  within,
} from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AuthStatus } from "../../features/auth";
import { Classroom } from "../../features/domain/classroom";
import { ErrorMessage } from "../../features/errors";
import { ClassroomStatus, addClassroom } from "../../features/classroomSlice";
import { Client } from "../../features/domain/client";
import { ClientStatus } from "../../features/clientsSlice";
import { ClassroomScheduling } from "../../component/scheduling/ClassroomScheduling";
import ClassroomSchedulingDoc from "./ClassroomScheduling.docs.mdx";
import { client } from "../../test-utils/clients/clients";
import { compose, context, rest } from "msw";
import { APIClassroomBuilder } from "../../test-utils/classroom/classroom";
import { SnackbarProvider } from "../../context/SnackbarProvider";

type ClassroomState = {
  classrooms: Classroom[];
  status:
    | ClassroomStatus.IDLE
    | ClassroomStatus.LOADING
    | ClassroomStatus.FAILED
    | ClassroomStatus.SUCCEEDED;
  error: ErrorMessage[];
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

const initialClassroomState: ClassroomState = {
  classrooms: [],
  status: ClassroomStatus.IDLE,
  error: [],
};

const initialClientsState: ClientState = {
  clients: [],
  status: ClientStatus.SUCCEEDED,
  error: [],
};

const withClientsState: ClientState = {
  clients: [client(), client("Charles", "Martin", "2")],
  status: ClientStatus.SUCCEEDED,
  error: [],
};

const initialProps = {
  date: parseISO("2021-05-07T09:00:00"),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClassroomScheduled: () => {},
};

type MockStoreProps = {
  classroomState: ClassroomState;
  clientsState: ClientState;
  children: ReactElement;
};

const Mockstore = ({
  classroomState,
  clientsState,
  children,
}: MockStoreProps) => {
  return (
    <Provider
      store={configureStore({
        reducer: {
          classrooms: createSlice({
            name: "classrooms",
            initialState: classroomState,
            reducers: {},
            extraReducers(builder) {
              builder
                .addCase(addClassroom.fulfilled, (state, action) => {
                  state.status = ClassroomStatus.SUCCEEDED;
                  state.classrooms.push(action.payload as Classroom);
                })
                .addCase(addClassroom.rejected, (state, action) => {
                  state.status = ClassroomStatus.FAILED;
                  state.error = action.payload as ErrorMessage[];
                });
            },
          }).reducer,
          clients: createSlice({
            name: "clients",
            initialState: clientsState,
            reducers: {},
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
  component: ClassroomScheduling,
  title: "Add classroom form",
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
      page: ClassroomSchedulingDoc,
    },
  },
} as ComponentMeta<typeof ClassroomScheduling>;

const Template: ComponentStory<typeof ClassroomScheduling> = (args) => (
  <ClassroomScheduling {...args} />
);

export const ClassroomSchedulingDetails = Template.bind({});
export const CalculateClassroomDuration = Template.bind({});
export const ClassroomSchedulingWithAttendees = Template.bind({});
export const ClassroomSchedulingError = Template.bind({});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
    #########################################################
    # Display classroom form                                #
    #########################################################
 */
ClassroomSchedulingDetails.decorators = [
  (story: any) => (
    <Mockstore
      classroomState={initialClassroomState}
      clientsState={initialClientsState}
    >
      {story()}
    </Mockstore>
  ),
];
ClassroomSchedulingDetails.args = {
  ...initialProps,
};

ClassroomSchedulingDetails.parameters = {
  msw: {
    handlers: [],
  },
};

ClassroomSchedulingDetails.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.getByText(
      `Scheduling classroom on ${intlFormat(parseISO("2021-05-07T09:00"), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    )
  ).toBeInTheDocument();
  await expect(canvas.getByLabelText(/position/i)).toHaveTextContent("1");
  await expect(await canvas.findByLabelText(/choose start date/i)).toHaveValue(
    "05/07/2021 09:00"
  );
  await expect(await canvas.findByLabelText(/recurrence/i)).toHaveValue(
    "05/07/2021 10:00"
  );
  const durationElement = canvas.getAllByLabelText("Duration")[0];
  await expect(within(durationElement).getByRole("button")).toHaveTextContent(
    "1h00"
  );
  await expect(canvas.getByRole("button", { name: /submit/i })).toBeDisabled();
};

/*
    #########################################################
    # Calculate classroom duration                          #
    #########################################################
 */

CalculateClassroomDuration.decorators = [
  (story: any) => (
    <Mockstore
      classroomState={initialClassroomState}
      clientsState={initialClientsState}
    >
      {story()}
    </Mockstore>
  ),
];
CalculateClassroomDuration.storyName =
  "Classroom duration may be determined from filled start and end time";
CalculateClassroomDuration.args = {
  ...initialProps,
};
CalculateClassroomDuration.parameters = {
  msw: {
    handlers: [],
  },
};

CalculateClassroomDuration.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.getByText(
      `Scheduling classroom on ${intlFormat(parseISO("2021-05-07T09:00"), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    )
  ).toBeInTheDocument();
  await expect(canvas.getByLabelText(/position/i)).toHaveTextContent("1");
  const startDateElement = await canvas.findByLabelText(/choose start date/i);
  userEvent.clear(startDateElement);
  userEvent.type(startDateElement, "05/07/2021 09:00");
  const recurrenceElement = await canvas.findByLabelText(/recurrence/i);
  userEvent.clear(recurrenceElement);
  userEvent.type(recurrenceElement, "05/07/2021 10:30");
  userEvent.type(
    canvas.getByRole("textbox", { name: /classroom's name/i }),
    "Cours tapis duo"
  );
  const durationElement = canvas.getAllByLabelText("Duration")[0];
  await expect(within(durationElement).getByRole("button")).toHaveTextContent(
    "1h30"
  );
  await expect(canvas.getByRole("button", { name: /submit/i })).toBeDisabled();
};
/*
    #########################################################
    # Fill classroom form with attendees                    #
    #########################################################
 */
ClassroomSchedulingWithAttendees.decorators = [
  (story: any) => (
    <Mockstore
      classroomState={initialClassroomState}
      clientsState={withClientsState}
    >
      {story()}
    </Mockstore>
  ),
];
ClassroomSchedulingWithAttendees.args = {
  ...initialProps,
};

ClassroomSchedulingWithAttendees.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/classrooms", (req, res, _) => {
        const response = new APIClassroomBuilder()
          .mat()
          .position(2)
          .startDate("2021-05-07T10:00")
          .endDate("2021-07-07T12:00")
          .duration(120)
          .attendees(["2"])
          .build();
        return res(compose(context.status(201), context.json(response)));
      }),
    ],
  },
};

ClassroomSchedulingWithAttendees.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  userEvent.type(
    canvas.getByRole("textbox", { name: /classroom's name/i }),
    "Cours tapis duo"
  );
  fireEvent.mouseDown(canvas.getByRole("button", { name: /subject/i }));
  userEvent.click(canvas.getByText(/mat/i));
  fireEvent.mouseDown(canvas.getByRole("button", { name: /position 1/i }));
  userEvent.click(canvas.getByText(/3/i));
  const startDateElement = await canvas.findByLabelText(/choose start date/i);
  userEvent.clear(startDateElement);
  userEvent.type(startDateElement, "05/07/2021 10:00");
  fireEvent.mouseDown(canvas.getByRole("button", { name: /duration 1h00/i }));
  userEvent.click(canvas.getByText(/2h00/i));
  userEvent.click(canvas.getByRole("combobox"));
  const attendees = within(screen.getByRole("presentation")).getByRole(
    "listbox"
  );
  userEvent.click(within(attendees).getByText(/martin charles/i));

  await expect(canvas.getByRole("button", { name: /submit/i })).toBeEnabled();
};

ClassroomSchedulingError.decorators = [
  (story: any) => (
    <Mockstore
      classroomState={initialClassroomState}
      clientsState={withClientsState}
    >
      {story()}
    </Mockstore>
  ),
];
ClassroomSchedulingError.args = {
  ...initialProps,
};
ClassroomSchedulingError.storyName = "Classroom cannot be created";
ClassroomSchedulingError.parameters = {
  msw: {
    handlers: [
      rest.post("http://localhost:8081/classrooms", (req, res, _) => {
        return res(
          compose(
            context.status(400),
            context.json({ detail: [{ msg: "Error occurred", type: "Error" }] })
          )
        );
      }),
    ],
  },
};
ClassroomSchedulingError.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  userEvent.type(
    canvas.getByRole("textbox", { name: /classroom's name/i }),
    "Cours tapis duo"
  );
  fireEvent.mouseDown(canvas.getByRole("button", { name: /subject/i }));
  userEvent.click(canvas.getByText(/mat/i));
  fireEvent.mouseDown(canvas.getByRole("button", { name: /position 1/i }));
  userEvent.click(canvas.getByText(/3/i));
  const startDateElement = await canvas.findByLabelText(/choose start date/i);
  userEvent.clear(startDateElement);
  userEvent.type(startDateElement, "05/07/2021 10:00");
  fireEvent.mouseDown(canvas.getByRole("button", { name: /duration 1h00/i }));
  userEvent.click(canvas.getByText(/2h00/i));
  userEvent.click(canvas.getByRole("combobox"));
  const attendees = within(screen.getByRole("presentation")).getByRole(
    "listbox"
  );
  userEvent.click(within(attendees).getByText(/martin charles/i));
  userEvent.click(canvas.getByRole("button", { name: /submit/i }));
  await sleep(100);

  await expect(
    screen.getByText(
      "Error occurred - Classroom 'Cours tapis duo' could not be created"
    )
  ).toBeInTheDocument();
};
