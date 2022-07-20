import {render} from "../../../test-utils/test-utils";
import {afterAll, afterEach, beforeAll, beforeEach, vi} from "vitest"
import React, {useEffect} from "react";
import {AddClassroomItem} from "../AddClassroomItem";
import userEvent from "@testing-library/user-event";
import {fireEvent, screen, waitForElementToBeRemoved, within} from "@testing-library/react";
import {RequestHandlerBuilders, ServerBuilder} from "../../../test-utils/server/server";
import {apiClient, ClientsBuilder} from "../../../test-utils/clients/clients";
import {ClassroomBuilder} from "../../../test-utils/classroom/classroom";
import {useDispatch} from "react-redux";
import {fetchClients} from "../../../features/clientsSlice";
import * as PropTypes from "prop-types";


describe("AddClassroomItem", () => {

    beforeAll(() => {
        vi.mock('@zach.codes/react-calendar', async () => {
            const reactCalendar = await vi.importActual('@zach.codes/react-calendar')

            return {
                ...reactCalendar,
                useMonthlyBody: vi.fn().mockReturnValue({day: new Date("2021-10-01T00:00:00")})
            }
        })
    })

    const onClassroomAdded = () => {
        return true
    }

    it("should display the classroom form when clicking on add button", () => {
        render(<AddClassroomItem onClassroomAdded={onClassroomAdded}/>)

        userEvent.click(screen.getByRole('button'))

        expect(screen.getByText('Add a classroom on 2021-10-01')).toBeInTheDocument()
    })

    it("should close the form when clicking outside", async () => {
        render(<AddClassroomItem onClassroomAdded={onClassroomAdded}/>)

        userEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Add a classroom on 2021-10-01')).toBeInTheDocument()
        userEvent.click(screen.getAllByRole('button')[0])

        await waitForElementToBeRemoved(() => screen.getByText('Add a classroom on 2021-10-01'))
    })

    describe("Filling classroom creation form", () => {
        const server = new ServerBuilder().serve(
            new RequestHandlerBuilders().get("/clients")
                .ok()
                .body(new ClientsBuilder()
                    .withClient(apiClient())
                    .withClient(apiClient("Bertrand", "Bougon", "2"))
                    .withClient(apiClient("Pierre", "Martin", "3"))
                    .withClient(apiClient("Jacques", "Martin", "4"))
                    .build())
                .build(),
            new RequestHandlerBuilders().post("/classrooms")
                .created()
                .body(new ClassroomBuilder()
                    .name('Cours duo')
                    .mat()
                    .startDate("2021-10-01T00:00:00")
                    .endDate("2021-10-01T01:00:00")
                    .attendees(["2", "4"])
                    .position(2)
                    .duration(120)
                    .build())
                .build()
        )

        const AddClassroomItemWrapper = ({onClassroomAdded}) => {
            const dispatch = useDispatch()

            useEffect(() => {
                dispatch(fetchClients())
            }, [dispatch])



            return (
                <div>
                    <AddClassroomItem onClassroomAdded={onClassroomAdded}/>
                </div>
            );
        }

        AddClassroomItemWrapper.propTypes = {onClassroomAdded: PropTypes.any}

        beforeAll(() => {
            vi.mock('@zach.codes/react-calendar', async () => {
                const reactCalendar = await vi.importActual('@zach.codes/react-calendar')

                return {
                    ...reactCalendar,
                    useMonthlyBody: vi.fn().mockReturnValue({day: new Date("2021-10-01T00:00:00")})
                }
            })
        })

        afterAll(() => {
            server.close()
        })

        beforeEach(() => {
            server.listen()
        })

        afterEach(() => {
            server.resetHandlers()
        })

        it("should add a classroom when form is complete and submitted", async () => {
            render(
                <AddClassroomItemWrapper onClassroomAdded={() => true}/>
            )
            userEvent.click(screen.getByRole('button'))

            userEvent.type(screen.getByRole('textbox', {name: /classroom's name/i}), 'Cours duo')

            fireEvent.mouseDown(screen.getAllByRole("button", {name: /subject/i})[0])
            const subject = within(screen.getByRole('presentation'));
            userEvent.click(subject.getByText(/mat/i));
            expect(screen.getByRole("button", {name: /mat/i})).toBeInTheDocument()

            fireEvent.mouseDown(screen.getAllByRole("button", {name: /1/i})[0])
            const positions = screen.getByRole("presentation");
            userEvent.click(within(positions).getByText(/2/i));
            expect(screen.getByRole("button", {name: /position 2/i})).toBeInTheDocument()

            fireEvent.mouseDown(screen.getAllByRole("button", {name: /1h00/i})[0])
            const duration = screen.getByRole("presentation");
            userEvent.click(within(duration).getByText(/2h00/i));
            expect(screen.getByRole("button", {name: /2h00/i})).toBeInTheDocument()

            userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Bertrand")
            const clients = await screen.getAllByRole("presentation")[0];
            userEvent.click(await within(clients).findByText(/bertrand/i))
            const attendees = screen.getByRole("textbox", {name: /attendees/i});
            userEvent.type(attendees, "Pierre")
            userEvent.click(await screen.findByText(/pierre/i))
            userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Jacques")
            userEvent.click(screen.getByText(/jacques/i))


            const attendeesSelect = screen.getByRole("combobox");
            expect(within(attendeesSelect).getByText(/bougon bertrand/i)).toBeInTheDocument()
            expect(within(attendeesSelect).getByText(/martin pierre/i)).toBeInTheDocument()
            expect(within(attendeesSelect).getByText(/martin jacques/i)).toBeInTheDocument()
            expect(screen.getByRole("button", {name: /position 3/i})).toBeInTheDocument()

            userEvent.click(screen.getByRole("button", {name: /submit/i}))
        })
    })
})