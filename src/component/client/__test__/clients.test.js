import React from "react";
import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {Clients} from "../clients";
import {render} from "react-dom";

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