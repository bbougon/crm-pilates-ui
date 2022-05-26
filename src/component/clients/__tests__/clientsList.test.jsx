import React from "react";
import {Clients} from "../ClientPage";
import {fireEvent, screen, waitFor, within} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {render} from "../../../test-utils/test-utils";
import {apiClient, ClientsBuilder} from "../../../test-utils/clients/clients";
import {APIDetail, APIErrorBody, RequestHandlerBuilders, ServerBuilder2} from "../../../test-utils/server/server";


describe('ClientList page', function () {

    describe('fetches clients when loading', function () {
        describe("retrieve them", () => {
            let clients = new ClientsBuilder()
                .withClient(apiClient())
                .withClient(apiClient("Pierre", "Martin", "1", [{value: 2, subject: "MAT"}, {
                    value: 5,
                    subject: "MACHINE_DUO"
                }]))
                .withClient(apiClient("Henri", "Verneuil", "2"))
                .withClient(apiClient("Bertholt", "Brecht", "3", [{value: 2, subject: "MAT"}, {
                    value: 5,
                    subject: "MACHINE_DUO"
                }, {value: 5, subject: "MACHINE_TRIO"}, {value: 5, subject: "MACHINE_PRIVATE"}]))
                .build();
            const server = new ServerBuilder2().serve(new RequestHandlerBuilders().get("/clients").ok().body(clients).build())

            beforeEach(() => server.listen())

            afterEach(() => server.resetHandlers())

            afterAll(() => server.close())

            it('and should display them', async () => {
                render(<Clients/>)

                expect(await waitFor(() => screen.getByText("Doe", {selector: 'h6'}))).toBeInTheDocument()
                expect(screen.getByText("John")).toBeInTheDocument()
                expect(screen.getByText("Martin", {selector: 'h6'})).toBeInTheDocument()
                expect(screen.getByText("Pierre")).toBeInTheDocument()
                expect(screen.getByText("Verneuil", {selector: 'h6'})).toBeInTheDocument()
                expect(screen.getByText("Henri")).toBeInTheDocument()
            })

            describe("interacting with them", () => {

                it('should display credits when clicking on name', async () => {
                    render(<Clients/>)

                    userEvent.click(await waitFor(() => screen.getByRole("button", {name: /martin/i})))

                    let clientDetails = screen.getByRole("region");
                    expect(within(clientDetails).getByText("2", {selector: 'span'})).toBeInTheDocument()
                    expect(within(clientDetails).getByText(/mat/i, {selector: 'p'})).toBeInTheDocument()
                    expect(within(clientDetails).getByText("5", {selector: 'span'})).toBeInTheDocument()
                    expect(within(clientDetails).getByText(/machine duo/i, {selector: 'p'})).toBeInTheDocument()
                })

                it('should add credits to existing credits', async () => {
                    const clients = new ClientsBuilder()
                        .withClient(apiClient("Pierre", "Martin", "1", [{value: 2, subject: "MAT"}, {
                            value: 5,
                            subject: "MACHINE_DUO"
                        }]))
                        .build();
                    server.resetHandlers(new RequestHandlerBuilders().get("/clients").ok().body(clients).build(), new RequestHandlerBuilders().post("/clients/1/credits").ok().body([{
                        value: 10,
                        subject: "MAT"
                    }]).build())
                    render(<Clients/>)

                    userEvent.click(await waitFor(() => screen.getByRole("button", {name: /martin/i})))
                    let clientDetails = screen.getByRole("region");
                    expect(within(clientDetails).getAllByRole("button", {name: /add credits/i})[0]).toBeDisabled()
                    userEvent.type(within(clientDetails).getAllByText(/amount of credits/i)[0], "10")
                    userEvent.click(within(clientDetails).getAllByRole("button", {name: /add credits/i})[0])

                    await waitFor(() => expect(within(screen.getByRole("region")).getAllByLabelText(/amount of credits/i, {selector: 'input'})[0]).toHaveValue(null))
                    expect(await within(clientDetails).findByText("12")).toBeInTheDocument()
                })

                it('should add a form to add credits when clicking on `+`', async () => {
                    const clients = new ClientsBuilder()
                        .withClient(apiClient("Pierre", "Martin", "1", [{value: 2, subject: "MAT"}, {
                            value: 5,
                            subject: "MACHINE_DUO"
                        }]))
                        .build();
                    server.resetHandlers(new RequestHandlerBuilders().get("/clients").ok().body(clients).build(), new RequestHandlerBuilders().post("/clients/1/credits").ok().body([{
                        value: 10,
                        subject: "MACHINE_TRIO"
                    }]).build())
                    render(<Clients/>)

                    userEvent.click(await waitFor(() => screen.getByRole("button", {name: /martin/i})))
                    let clientDetails = screen.getByRole("region");
                    userEvent.click(within(clientDetails).getAllByRole("button")[2])

                    expect(screen.getByRole("button", {name: /subject/i})).toBeInTheDocument()

                    fireEvent.mouseDown(screen.getByRole("button", {name: /subject/i}))
                    const subject = within(screen.getByRole('listbox'));
                    expect(subject.getByText(/machine trio/i)).toBeInTheDocument()
                    expect(subject.getByText(/machine private/i)).toBeInTheDocument()
                    expect(subject.queryByText(/mat/i)).not.toBeInTheDocument()
                    expect(subject.queryByText(/machine duo/i)).not.toBeInTheDocument()

                    userEvent.click(subject.getByText(/machine trio/i));
                    userEvent.type((within(clientDetails).getAllByText(/amount of credits/i))[2], "10")
                    userEvent.click(within(clientDetails).getAllByRole("button", {name: /add credits/i})[2])

                    expect(await within(clientDetails).findByText("2")).toBeInTheDocument()
                    expect(await within(clientDetails).findByText(/mat/i)).toBeInTheDocument()
                    expect(await within(clientDetails).findByText("5")).toBeInTheDocument()
                    expect(await within(clientDetails).findByText(/machine duo/i)).toBeInTheDocument()
                    expect(await within(clientDetails).findByText("10")).toBeInTheDocument()

                    expect(screen.queryByRole("button", {name: /subject/i})).not.toBeInTheDocument()
                })

                it("should disabled add form button if no more subjects available for client", async () => {
                    render(<Clients/>)

                    userEvent.click(await waitFor(() => screen.getByRole("button", {name: /brecht/i})))
                    let clientDetails = screen.getByRole("region");

                    expect(within(clientDetails).getAllByRole("button")[4]).toBeDisabled()
                })

                describe("faces errors", () => {

                    it("should display amount of credits filed in error when negative value is filled", async () => {
                        let clients = new ClientsBuilder()
                            .withClient(apiClient("Pierre", "Martin", "1", [{value: 2, subject: "MAT"}, {
                                value: 5,
                                subject: "MACHINE_DUO"
                            }]))
                            .build();
                        server.resetHandlers(new RequestHandlerBuilders().get("/clients").ok().body(clients).build())
                        render(<Clients/>)

                        userEvent.click(await waitFor(() => screen.getByRole("button", {name: /martin/i})))
                        let clientDetails = screen.getByRole("region");
                        userEvent.type(within(clientDetails).getAllByText(/amount of credits/i)[0], "-1")

                        expect(within(clientDetails).getByDisplayValue(/-1/i)).toBeInvalid()
                        expect(within(clientDetails).getAllByRole("button", {name: /add credits/i})[0]).toBeDisabled()
                    })
                })
            })

        })

        describe("faces an error", () => {

            const server = new ServerBuilder2().serve(new RequestHandlerBuilders().get("/clients").unprocessableEntity().body(new APIErrorBody().dummyDetail().build()).build())

            beforeEach(() => server.listen())

            afterEach(() => server.resetHandlers())

            afterAll(() => server.close())

            it("and should display it", async () => {
                render(<Clients/>)

                expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
                expect(await screen.findByText("an error message", {selector: 'p'})).toBeInTheDocument()
                expect(await screen.findByText("an error type", {selector: 'p'})).toBeInTheDocument()
            })
        })

    })

    describe('displays a form to create a client', function () {
        let emptyClients = new RequestHandlerBuilders().get("/clients").ok().body([]).build();
        const server = new ServerBuilder2().serve(emptyClients)

        beforeAll(() => server.listen())

        afterEach(() => server.resetHandlers())

        afterAll(() => server.close())

        describe("without credits", () => {

            it('named John Doe', async () => {
                server.resetHandlers(emptyClients, new RequestHandlerBuilders().post("/clients").ok().body(apiClient()).build())
                render(<Clients/>)

                userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
                userEvent.type(screen.getByText("Client's name"), "Doe")
                userEvent.type(screen.getByText("Client's firstname"), "John")
                userEvent.click(screen.getByRole("button", {name: /submit/i}))

                expect(await screen.findByText("Doe", {selector: 'h6'})).toBeInTheDocument()
                expect(await screen.findByText("John",)).toBeInTheDocument()
                await waitFor(() => expect(screen.getByLabelText("Client's name *", {selector: 'input'})).toHaveValue(""))
                await waitFor(() => expect(screen.getByLabelText("Client's firstname *", {selector: 'input'})).toHaveValue(""))
            })
        })

        describe("with credits", () => {

            it('named Joseph Pilates', async () => {
                server.resetHandlers(emptyClients, new RequestHandlerBuilders().post("/clients").ok().body(apiClient("Joseph", "Pilates", "2", [{
                    value: 10,
                    subject: "MACHINE_TRIO"
                }])).build())
                render(<Clients/>)

                userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
                userEvent.type(screen.getByText("Client's name"), "Pilates")
                userEvent.type(screen.getByText("Client's firstname"), "Joseph")

                userEvent.click(screen.getAllByRole("button")[1])
                fireEvent.mouseDown(screen.getByRole("button", {name: /subject/i}))
                const subject = within(screen.getByRole('listbox'));
                userEvent.click(subject.getByText(/machine trio/i));
                userEvent.type(screen.getAllByText(/amount of credits/i)[0], "10")
                userEvent.click(screen.getByRole("button", {name: /add credits/i}))

                userEvent.click(screen.getByRole("button", {name: /submit/i}))

                expect(await screen.findByText("Pilates", {selector: 'h6'})).toBeInTheDocument()
                expect(await screen.findByText("Joseph",)).toBeInTheDocument()
                await waitFor(() => expect(screen.getByLabelText("Client's name *", {selector: 'input'})).toHaveValue(""))
                await waitFor(() => expect(screen.getByLabelText("Client's firstname *", {selector: 'input'})).toHaveValue(""))

                userEvent.click(await waitFor(() => screen.getByRole("button", {name: /pilates/i})))

                let clientDetails = screen.getAllByRole("region")[1];
                expect(within(clientDetails).getByText("10", {selector: 'span'})).toBeInTheDocument()
                expect(within(clientDetails).getByText(/machine trio/i, {selector: 'p'})).toBeInTheDocument()
            })
        })

        describe("faces an error when creating a client", function () {

            it("should display the error", async () => {
                server.resetHandlers(emptyClients, new RequestHandlerBuilders().post("/clients").unprocessableEntity().body(new APIErrorBody()
                    .withDetail(APIDetail("You must provide the client firstname", "value_error"))
                    .withDetail(APIDetail("You must provide the client lastname", "value_error"))
                    .build()).build())
                render(<Clients/>)

                userEvent.click(screen.getByRole("button", {name: /add a new client/i}))
                userEvent.type(screen.getByText("Client's name"), "{empty}")
                userEvent.type(screen.getByText("Client's firstname"), "{empty}")
                userEvent.click(screen.getByRole("button", {name: /submit/i}))

                expect(await screen.findByText("An error occurred (see message below):", {selector: 'h5'})).toBeInTheDocument()
                await waitFor(() => expect(screen.queryByText("You must provide the client firstname", {selector: 'p'})).toBeInTheDocument())
                await waitFor(() => expect(screen.queryByText("You must provide the client lastname", {selector: 'p'})).toBeInTheDocument())
                await waitFor(() => expect(screen.queryAllByText("value_error", {selector: 'p'})).toBeTruthy())
            })
        })
    })
})