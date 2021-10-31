import {render} from "../../../test-utils/test-utils";
import {fireEvent, screen, within} from "@testing-library/react";
import {AddClassroomForm} from "../addClassroomForm";
import userEvent from "@testing-library/user-event";
import {client, ClientsBuilder} from "../../../test-utils/clients/clients";

describe("Add classroom form", () => {

    it('Submit should be disabled on loading', () => {
        render(<AddClassroomForm date={new Date()} clients={[]} />)

        expect(screen.getByRole("button", {name: /submit/i})).toBeDisabled()
    })

    it('Submit should be enabled hence all fields are filled in', () => {
        let date = new Date();
        render(<AddClassroomForm date={date} clients={[]} />)

        userEvent.type(screen.getByText("Classroom's name"), "Cours Duo")
        fireEvent.mouseDown(screen.getByRole("button", {name: /position 1/i}))
        const position = within(screen.getByRole('listbox'));
        userEvent.click(position.getByText(/2/i));
        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const duration = within(screen.getByRole('listbox'));
        userEvent.click(duration.getByText(/2h00/i));

        expect(screen.getByRole("button", {name: /submit/i})).toBeEnabled()
    })

    it("should display 1 hour duration by default", () => {
        render(<AddClassroomForm date={new Date()} clients={[]} />)

        expect(screen.getByRole("button", {name: /duration 1h00/i})).toHaveTextContent("1h00")
    })


    it("should display duration when selecting '1h30'", () => {
        render(<AddClassroomForm date={new Date()} clients={[]}/>)

        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const listbox = within(screen.getByRole('listbox'));
        userEvent.click(listbox.getByText(/1h30/i));

        expect(screen.getByRole("button", {name: /duration 1h30/i})).toHaveTextContent("1h30")
    })


    it('should submit with end date according to classroom duration', function () {
        let date = new Date();
        let clients = new ClientsBuilder().withClient(client()).withClient(client("Bertrand", "Bougon", "2")).build();
        const onClassroomAdd = (classroom) => {
            expect(classroom.classroomName).toBe("Cours Duo")
            expect(classroom.classroomStartDateTime).toStrictEqual(date)
            expect(classroom.classroomEndDateTime).toBeNull()
            expect(classroom.position).toBe(1)
            expect(classroom.duration).toBe(90)
            expect(classroom.attendees).toHaveLength(0)
        }
        render(<AddClassroomForm date={date} clients={clients} onSubmitClick={onClassroomAdd}/>)

        userEvent.type(screen.getByText("Classroom's name"), "Cours Duo")
        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const duration = within(screen.getByRole('listbox'));
        userEvent.click(duration.getByText(/1h30/i));
        userEvent.click(screen.getByRole("button", {name: /submit/i}))
    });


    it('should submit with attendees', function () {
        let date = new Date();
        let clients = new ClientsBuilder().withClient(client()).withClient(client("Bertrand", "Bougon", "2")).build();
        const onClassroomAdd = (classroom) => {
          expect(classroom.classroomName).toBe("Cours Duo")
          expect(classroom.classroomStartDateTime).toStrictEqual(date)
          expect(classroom.classroomEndDateTime).toBeNull()
          expect(classroom.position).toBe(2)
          expect(classroom.duration).toBe(120)
          expect(classroom.attendees).toHaveLength(1)
          expect(classroom.attendees[0]).toStrictEqual({firstname: "Bertrand", lastname:"Bougon", id: "2"})
        }
        render(<AddClassroomForm date={date} clients={clients} onSubmitClick={onClassroomAdd}/>)

        userEvent.type(screen.getByText("Classroom's name"), "Cours Duo")
        fireEvent.mouseDown(screen.getByRole("button", {name: /position 1/i}))
        const position = within(screen.getByRole('listbox'));
        userEvent.click(position.getByText(/2/i));
        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const duration = within(screen.getByRole('listbox'));
        userEvent.click(duration.getByText(/2h00/i));
        userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Bertrand")
        userEvent.click(screen.getByText(/bertrand/i))
        userEvent.click(screen.getByRole("button", {name: /submit/i}))

        let attendeesSelect = screen.getByRole("combobox");
        expect(within(attendeesSelect).getByText(/bougon bertrand/i)).toBeInTheDocument()
    });

    it('should set positions according to attendees added to classroom',  () => {
        let date = new Date();
        let clients = new ClientsBuilder()
            .withClient(client())
            .withClient(client("Bertrand", "Bougon", "2"))
            .withClient(client("Pierre", "Martin", "3"))
            .withClient(client("Jacques", "Martin", "4"))
            .build();
        render(<AddClassroomForm date={date} clients={clients}/>)

        userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Bertrand")
        userEvent.click(screen.getByText(/bertrand/i))
        userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Pierre")
        userEvent.click(screen.getByText(/pierre/i))
        userEvent.type(screen.getByRole("textbox", {name: /attendees/i}), "Jacques")
        userEvent.click(screen.getByText(/jacques/i))

        let attendeesSelect = screen.getByRole("combobox");
        expect(within(attendeesSelect).getByText(/bougon bertrand/i)).toBeInTheDocument()
        expect(within(attendeesSelect).getByText(/martin pierre/i)).toBeInTheDocument()
        expect(within(attendeesSelect).getByText(/martin jacques/i)).toBeInTheDocument()
        expect(screen.getByRole("button", {name: /position 3/i})).toBeInTheDocument()
    });

})