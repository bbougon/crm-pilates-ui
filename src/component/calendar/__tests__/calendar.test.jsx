import {render} from "../../../test-utils/test-utils";
import {screen} from "@testing-library/react";
import React from "react";
import Calendar from "../Calendar";
import {APIErrorBody, RequestHandlerBuilders, ServerBuilder2} from "../../../test-utils/server/server";

describe('Calendar page', () => {
    let currentDate = new Date();
    let currentMonth = currentDate.toISOString()
    let previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()).toISOString()
    let nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()).toISOString()

    const emptyClients = new RequestHandlerBuilders().get("/clients").ok().body([]).build();

    const server = new ServerBuilder2().serve(emptyClients)

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())


    it('should have a plus button on each day', async () => {
        server.resetHandlers(emptyClients, new RequestHandlerBuilders().get("/sessions")
            .ok()
            .body([])
            .header({"X-Link": `</sessions?month=${previousMonth}>; rel="previous", </sessions?month=${currentMonth}>; rel="current", </sessions?month=${nextMonth}>; rel="next"`})
            .build()
        )
        render(<Calendar date={new Date("2021-10-10T11:20:00")}/>)

        expect(screen.getAllByTestId("AddIcon")).toHaveLength(26)
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