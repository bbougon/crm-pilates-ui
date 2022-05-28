import reducer, {addCredits, fetchClients} from "../clientsSlice";
import {LoadingState} from "../../test-utils/features/clients/clientStateFixtures";
import {FulFilledAction, RejectedAction} from "../../test-utils/features/actionFixtures";
import {client, ClientsBuilder} from "../../test-utils/clients/clients";
import {Subjects} from "../domain/subjects";

describe('ClientsSlice', () => {

    describe("Fetching clients", () => {
        it('should override previous state with fetched clients', async () => {
            const previousState = new LoadingState().withClient(client()).build()
            let all_clients = new ClientsBuilder()
                .withClient(client(undefined, undefined, undefined, undefined))
                .withClient(client("Pierre", "Martin", "33da6f24-efda-4c16-b8af-e5e822fc5860", undefined))
                .withClient(client("Henri", "Verneuil", "33da6bca-efda-4c16-b8af-e5e822fc5901", undefined))
                .build()
            const action = new FulFilledAction(fetchClients).withPayload({clients: all_clients}).build()

            expect(reducer(previousState, action)).toEqual({
                clients: all_clients,
                status: "succeeded",
                error: []
            })
        })

        describe("Errors", () => {

            it("should handle errors from api", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withStructuredPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "an error message", type: "an error type", origin: "Get clients"}]
                })
            })


            it("should handle errors in payload", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withErrorPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "error", type: "type", origin: "Get clients"}]
                })
            })

            it("should handle errors with no payload", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withoutPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "We could not fetch the request", origin: "Get clients"}]
                })
            })
        })
    })

    describe("Adding credits", () => {
        it("should add credits to client", async () => {
            const previousState = new LoadingState().withClient(client("John", "Doe", "1", [{
                value: 5,
                subject: Subjects.MAT
            }])).build()

            const action = new FulFilledAction(addCredits).withPayload({
                clientId: "1",
                creditsAmount: 10,
                subject: "MACHINE_DUO"
            }).build()

            expect(reducer(previousState, action)).toEqual({
                clients: [{
                    firstname: "John",
                    lastname: "Doe",
                    id: "1",
                    credits: [
                        {
                            value: 5,
                            subject: "MAT"
                        }, {
                            value: 10,
                            subject: "MACHINE_DUO"
                        }
                    ]
                }],
                status: "succeeded",
                error: []
            })
        })

        it("should update client credits", async () => {
            const previousState = new LoadingState().withClient(client("John", "Doe", "1", [{
                value: 5,
                subject: Subjects.MAT
            }])).build()

            const action = new FulFilledAction(addCredits).withPayload({
                clientId: "1",
                creditsAmount: 10,
                subject: "MAT"
            }).build()

            expect(reducer(previousState, action)).toEqual({
                clients: [{
                    firstname: "John",
                    lastname: "Doe",
                    id: "1",
                    credits: [{
                        value: 15,
                        subject: "MAT"
                    }]
                }],
                status: "succeeded",
                error: []
            })
        })
    })
})