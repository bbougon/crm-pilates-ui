import {render} from "../../../test-utils/test-utils";
import {fireEvent, screen, within} from "@testing-library/react";
import {AddClassroomForm} from "../../classroom/addClassroomForm";

describe("Add classroom form", () => {

    it("should display 1 hour duration by default", () => {
        render(<AddClassroomForm date={new Date()} />)

        expect(screen.getByRole("button", {name: /duration 1h00/i})).toHaveTextContent("1h00")
    })


    it("should display duration when selecting '1h30'", () => {
        render(<AddClassroomForm date={new Date()} />)

        fireEvent.mouseDown(screen.getByRole("button", {name: /duration 1h00/i}))
        const listbox = within(screen.getByRole('listbox'));
        fireEvent.click(listbox.getByText(/1h30/i));

        expect(screen.getByRole("button", {name: /duration 1h30/i})).toHaveTextContent("1h30")
    })
})