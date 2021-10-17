import {render} from "../../../test-utils/test-utils";
import {prettyDOM} from "@testing-library/react";
import React from "react";
import Calendar from "../calendar";

describe('Calendar page', function () {

    it('should be displayed', () => {
        const {container} = render(<Calendar/>)

        expect(prettyDOM(container)).toMatchSnapshot()
    })
})