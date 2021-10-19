import {render} from "../../../test-utils/test-utils";
import {prettyDOM, screen} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";

describe('Calendar page', function () {

    it('should be displayed', () => {
        const {container} = render(<Calendar date={new Date("2021-09-08T12:00:00+01:00")}/>)

        expect(prettyDOM(container)).toMatchSnapshot()
    })

    it('should have a plus button on each day', () => {
        render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

        expect(screen.getAllByTestId("AddIcon")).toHaveLength(31)
    })


})