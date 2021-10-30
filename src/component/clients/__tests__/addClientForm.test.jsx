import {render} from "../../../test-utils/test-utils";
import {AddClientForm} from "../addClientForm";
import {screen} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import React from "react";

describe('Create Client', () => {

    it("Submit should be disabled on loading", () => {
        render(<AddClientForm />)

        userEvent.click(screen.getByRole("button", {name: /add a new client/i}))

        expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled()
    })

    it("Submit should be disabled if only firstname is filled", () => {
        render(<AddClientForm />)

        userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
        userEvent.type(screen.getByText("Client's firstname"), "John")

        expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled()
    })

    it("Submit should be enabled hence firstname and lastname are filled", () => {
        render(<AddClientForm />)

        userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
        userEvent.type(screen.getByText("Client's name"), "Doe")
        userEvent.type(screen.getByText("Client's firstname"), "John")

        expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled()
    })
})