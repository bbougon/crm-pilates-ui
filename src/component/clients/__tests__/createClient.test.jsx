import React from "react";
import {afterAll, afterEach, beforeAll} from 'vitest'
import {Clients} from "../ClientPage";
import {screen} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {render} from "../../../test-utils/test-utils";
import {APIDetail, APIErrorBody, RequestHandlerBuilders, ServerBuilder} from "../../../test-utils/server/server";

describe('ClientList page', function () {

    describe("faces an error when creating a client", function () {
        const emptyClients = new RequestHandlerBuilders().get("/clients").ok().body([]).build();
        const server = new ServerBuilder().serve(emptyClients)

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it("should display the error", async () => {
            server.resetHandlers(
                emptyClients,
                new RequestHandlerBuilders().post("/clients").unprocessableEntity().body(new APIErrorBody()
                    .withDetail(APIDetail("You must provide the client firstname", "value_error"))
                    .withDetail(APIDetail("You must provide the client lastname", "value_error"))
                    .build()).build())
            render(<Clients/>)

            userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
            userEvent.type(screen.getByText("Client's name"), "{empty}")
            userEvent.type(screen.getByText("Client's firstname"), "{empty}")
            userEvent.click(screen.getByRole("button", {name: /submit/i}))

            expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
            await screen.findByText("You must provide the client firstname", {selector: 'p'})
            await screen.findByText("You must provide the client lastname", {selector: 'p'})
            await screen.findAllByText("value_error", {selector: 'p'})
        })
    })
})