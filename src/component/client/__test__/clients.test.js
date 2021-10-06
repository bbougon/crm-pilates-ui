import React from "react";
import Enzyme, {mount} from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {Input} from "@material-ui/core";
import {Clients} from "../clients";
import {render} from "react-dom";
import {prettyDOM} from "@testing-library/react";

Enzyme.configure({adapter: new Adapter()});

describe('Clients', function() {

    let container = null

    beforeEach(() => {
        container = document.createElement("div")
    })

    it('should display the client page', () => {
        const wrapper = render(<Clients />, container)

        expect(container.innerHTML).toMatchSnapshot()
    })
})