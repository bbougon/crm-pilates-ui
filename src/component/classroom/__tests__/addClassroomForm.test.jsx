import {render} from "../../../test-utils/test-utils";
import {fireEvent, screen, within} from "@testing-library/react";
import {AddClassroomForm} from "../AddClassroomForm";
import userEvent from "@testing-library/user-event";

describe("Add classroom form", () => {

    it('Submit should be disabled on loading', () => {
        render(<AddClassroomForm date={new Date()} />)

        expect(screen.getByRole("button", {name: /submit/i})).toBeDisabled()
    })

    it('Submit should be enabled hence all fields are filled in', () => {
        let date = new Date();
        render(<AddClassroomForm date={date} />)

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
        render(<AddClassroomForm date={new Date()} />)

        expect(screen.getByRole("button", {name: /duration 1h00/i})).toHaveTextContent("1h00")
    })


    it("should display duration when selecting '1h30'", () => {
        render(<AddClassroomForm date={new Date()} />)

        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const listbox = within(screen.getByRole('listbox'));
        userEvent.click(listbox.getByText(/1h30/i));

        expect(screen.getByRole("button", {name: /duration 1h30/i})).toHaveTextContent("1h30")
    })

})