import React, {ReactElement} from 'react';
import {parseISO} from "date-fns";
import {Provider} from 'react-redux';
import {configureStore, createSlice} from '@reduxjs/toolkit';
import {store} from "../../app/store";
import {within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {AuthStatus} from "../../features/auth";
import {Classroom} from "../../features/domain/classroom";
import {ErrorMessage} from "../../features/errors";
import {addClassroom, ClassroomStatus} from "../../features/classroomSlice";
import {Client} from "../../features/domain/client";
import {ClientStatus} from "../../features/clientsSlice";
import {AddClassroomForm} from "../../component/classroom/AddClassroomForm";
import AddClassroomFormDoc from "./AddClassroomForm.docs.mdx"

type ClassroomState = {
    classrooms: Classroom[],
    status: ClassroomStatus.IDLE | ClassroomStatus.LOADING | ClassroomStatus.FAILED | ClassroomStatus.SUCCEEDED,
    error: ErrorMessage[]
}

type ClientState = {
    clients: Client[];
    status: ClientStatus.IDLE | ClientStatus.LOADING | ClientStatus.SUCCEEDED | ClientStatus.FAILED | ClientStatus.CREATION_FAILED;
    error: ErrorMessage[]
}

const initialClassroomState: ClassroomState = {
    classrooms: [],
    status: ClassroomStatus.IDLE,
    error: [],
}

const initialClientsState: ClientState = {
    clients: [],
    status: ClientStatus.SUCCEEDED,
    error: []
}

const initialProps = {
    date: parseISO('2021-05-07T09:00:00'),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClassroomAdded: () => {
    }
}

type MockStoreProps = {
    classroomState: ClassroomState
    clientsState: ClientState
    children: ReactElement
}

const Mockstore = ({classroomState, clientsState, children}: MockStoreProps) => {
    return (
        <Provider
            store={configureStore({
                reducer: {
                    classrooms: createSlice({
                        name: 'classrooms',
                        initialState: classroomState,
                        reducers: {},
                        extraReducers(builder) {
                            builder
                                .addCase(addClassroom.fulfilled, (state, action) => {
                                    state.status = ClassroomStatus.SUCCEEDED
                                    state.classrooms.push(action.payload as Classroom)
                                })
                        }
                    }).reducer,
                    clients: createSlice({
                        name: 'clients',
                        initialState: clientsState,
                        reducers: {}
                    }).reducer,
                    login: createSlice({
                        name: 'login',
                        initialState: {
                            token: {token: "token", type: "bearer"},
                            status: AuthStatus.SUCCEEDED,
                            error: []
                        },
                        reducers: {},
                        extraReducers: {}
                    }).reducer
                },
            })}
        >
            {children}
        </Provider>
    )
};

export default {
    component: AddClassroomForm,
    title: 'Add classroom form',
    decorators: [(story: any) => <Provider store={store}>{story()}</Provider>],
    excludeStories: /.*MockedState$/,
    parameters: {
        docs: {
            page: AddClassroomFormDoc
        }
    }
} as ComponentMeta<typeof AddClassroomForm>;

const Template: ComponentStory<typeof AddClassroomForm> = (args) => <AddClassroomForm {...args} />;

export const AddClassroomDetails = Template.bind({});

AddClassroomDetails.decorators = [
    (story: any) => <Mockstore classroomState={initialClassroomState}
                               clientsState={initialClientsState}>{story()}</Mockstore>,
]
AddClassroomDetails.args = {
    ...initialProps
};

AddClassroomDetails.parameters = {
    msw: {
        handlers: [],
    },
};

AddClassroomDetails.play = async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Add a classroom on 2021-05-07')).toBeInTheDocument()
    await expect(canvas.getByLabelText(/position/i)).toHaveTextContent('1')
    const startDateElement = canvas.getByLabelText(/choose start date/i);
    await expect(within(startDateElement).getByRole('textbox')).toHaveValue('05/07/2021 09:00')
    const recurrenceElement = canvas.getByLabelText(/recurrence/i);
    await expect(within(recurrenceElement).getByRole('textbox')).toHaveValue('05/07/2021 10:00')
    const durationElement = canvas.getAllByLabelText("Duration")[0];
    await expect(within(durationElement).getByRole('button')).toHaveTextContent('1h00')
    await expect(canvas.getByRole('button', {name: /submit/i})).toBeDisabled()
};

