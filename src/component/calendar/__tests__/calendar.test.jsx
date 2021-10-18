import {render} from "../../../test-utils/test-utils";
import {prettyDOM, screen} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";

describe('Calendar page', function () {

    it('should be displayed', () => {
        const {container} = render(<Calendar/>)

        expect(prettyDOM(container)).toMatchSnapshot()
    })

    it('should have a plus button on each day', () => {
        render(<Calendar/>)

        expect(screen.getAllByTestId("AddIcon")).toHaveLength(31)
    })
})