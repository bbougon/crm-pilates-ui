import {render} from "../../../test-utils/test-utils";
import {screen, waitFor} from "@testing-library/react";
import React from "react";
import Calendar from "../Calendar";
import {
    APIErrorBody,
    RequestHandlerBuilders,
    ServerBuilder,
    SessionXLinkValueHeaderBuilder,
    XLinkHeaderBuilder
} from "../../../test-utils/server/server";

describe('Calendar page', () => {
    const emptyClients = new RequestHandlerBuilders().get("/clients").ok().body([]).build();

    const server = new ServerBuilder().serve(emptyClients)

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())


    it('should have a plus button on each day', async () => {
        server.resetHandlers(emptyClients, new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body([])
            .header(new XLinkHeaderBuilder().value(new SessionXLinkValueHeaderBuilder().current(new Date())))
            .build()
        )
        render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

        expect(await waitFor(() =>screen.getAllByTestId("AddIcon"))).toHaveLength(26)
    })


    describe('Load sessions facing an error', () => {

        it('should display the error', async () => {
            server.resetHandlers(
                new RequestHandlerBuilders()
                    .get("/sessions")
                    .unprocessableEntity()
                    .body(new APIErrorBody()
                        .dummyDetail()
                        .build())
                    .build(),
                emptyClients
            )

            render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

            expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
            expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
            expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
        })
    })


})