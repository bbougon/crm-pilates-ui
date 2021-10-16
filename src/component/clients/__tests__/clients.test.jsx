import React from "react";
import {Clients} from "../clients";
import {prettyDOM, screen} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {render} from "../../../test-utils/test-utils";


describe('Clients', function () {
    const server = setupServer(
        rest.get('/clients', (req, res, ctx) => {
            return res(ctx.json([]))
        }),
    )

    beforeAll(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it('should display the client page', () => {
        const {container} = render(<Clients/>)

        expect(prettyDOM(container)).toMatchSnapshot()
    })

    describe('Loading the client page', function () {
        describe("when retrieving the clients", () => {
            const server = setupServer(
                rest.get('/clients', (req, res, ctx) => {
                    return res(ctx.json([
                        {
                            firstname: "John",
                            lastname: "Doe",
                            id: "33da6f12-efda-4c16-b8af-e5e822fc5459",
                        },
                        {
                            firstname: "Pierre",
                            lastname: "Martin",
                            id: "33da6f24-efda-4c16-b8af-e5e822fc5860",
                        },
                        {
                            firstname: "Henri",
                            lastname: "Verneuil",
                            id: "33da6bca-efda-4c16-b8af-e5e822fc5901",
                        }
                    ]))
                }),
            )

            beforeAll(() => server.listen())

            afterEach(() => server.resetHandlers())

            afterAll(() => server.close())

            it('they should be displayed', async () => {
                render(<Clients/>)

                expect(await screen.findByText("Doe", {selector: 'h6'})).toBeInTheDocument()
                expect(await screen.findByText("John")).toBeInTheDocument()
                expect(await screen.findByText("Martin", {selector: 'h6'})).toBeInTheDocument()
                expect(await screen.findByText("Pierre")).toBeInTheDocument()
                expect(await screen.findByText("Verneuil", {selector: 'h6'})).toBeInTheDocument()
                expect(await screen.findByText("Henri")).toBeInTheDocument()
            })
        })

        describe("when getting an error", () => {
            const server = setupServer(
                rest.get('/clients', (req, res, ctx) => {
                    return res(
                        ctx.status(422),
                        ctx.json({
                            detail: [
                                {
                                    loc: [
                                        "a location"
                                    ],
                                    msg: "an error message",
                                    type: "an error type"
                                }
                            ]
                        }),
                    )
                }),
            )

            beforeAll(() => server.listen())

            afterEach(() => server.resetHandlers())

            afterAll(() => server.close())

            it("it should be displayed", async () => {
                render(<Clients/>)

                expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
                expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
                expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
            })
        })

    })

    describe('Creating a client', function () {
        const server = setupServer(
            rest.get('/clients', (req, res, ctx) => {
                return res(ctx.json([]))
            }),
            rest.post('/clients', (req, res, ctx) => {
                return res(ctx.json({
                    firstname: "John",
                    lastname: "Doe",
                    id: "33da6f12-efda-4c16-b8af-e5e822fc5459",
                }))
            }),
        )

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        it('should create John Doe', async () => {
            render(<Clients/>)

            userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
            userEvent.type(screen.getByText("Client's name"), "Doe")
            userEvent.type(screen.getByText("Client's firstname"), "John")
            userEvent.click(screen.getByRole("button", {name: /submit/i}))

            expect(await screen.queryByDisplayValue("Doe")).toBeInTheDocument()
            expect(await screen.queryByDisplayValue("John")).toBeInTheDocument()
            expect(await screen.getByLabelText("Client's name *", {selector: 'input'})).toBeEmptyDOMElement()
            expect(await screen.getByLabelText("Client's firstname *", {selector: 'input'})).toBeEmptyDOMElement()
        })
    })
})