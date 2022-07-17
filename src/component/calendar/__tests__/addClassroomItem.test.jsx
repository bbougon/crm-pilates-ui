import {render} from "../../../test-utils/test-utils";
import {beforeAll, vi} from "vitest"
import React from "react";
import {AddClassroomItem} from "../AddClassroomItem";
import userEvent from "@testing-library/user-event";
import {fireEvent, screen, waitFor, waitForElementToBeRemoved} from "@testing-library/react";

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
        render(<AddClassroomItem onClassroomAdded={onClassroomAdded} />)

        userEvent.click(screen.getByRole('button'))

        expect(screen.getByText('Add a classroom on 2021-10-01')).toBeInTheDocument()
    })

    it("should close the form when clicking outside", async () => {
        render(<AddClassroomItem onClassroomAdded={onClassroomAdded} />)

        userEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Add a classroom on 2021-10-01')).toBeInTheDocument()
        userEvent.click(screen.getAllByRole('button')[0])

        await waitForElementToBeRemoved(() => screen.getByText('Add a classroom on 2021-10-01'))
    })
})