import {afterEach, beforeEach, describe, it} from "vitest";
import {render} from "../test-utils/test-utils";
import App from "../App";
import {screen, waitFor} from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";


describe("App", () => {

    beforeEach(() => sessionStorage.setItem("token", JSON.stringify({token: "my-token", type: "bearer"})))
    afterEach(() => sessionStorage.removeItem("token"))

    it('should display home page if authenticated', async () => {
        render(<App/>);

        expect(await waitFor(() => screen.findByText(/welcome home/i))).toBeInTheDocument()
    });

    describe("Client page", () => {

        it('should be displayed', async () => {
            render(<App/>)

            userEvent.click(screen.getAllByRole("link")[3])

            expect(await waitFor(() => screen.findByText(/add a new client/i))).toBeInTheDocument()
        })
    })
})