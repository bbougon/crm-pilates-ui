import reducer, {fetchClients} from "../clientsSlice";
import {LoadingState} from "../../test-utils/features/clients/clientStateFixtures";
import {FulFilledAction, RejectedAction} from "../../test-utils/features/actionFixtures";
import {client, ClientsBuilder} from "../../test-utils/clients/clients";

describe('ClientsSlice', () => {

    describe("Fetching clients", () => {
        it('it should override previous state with fetched clients', async () => {
            const previousState = new LoadingState().withClient(client()).build()
            let all_clients = new ClientsBuilder()
                .withClient(client())
                .withClient(client("Pierre", "Martin", "33da6f24-efda-4c16-b8af-e5e822fc5860"))
                .withClient(client("Henri", "Verneuil", "33da6bca-efda-4c16-b8af-e5e822fc5901"))
                .build()
            const action = new FulFilledAction(fetchClients).withPayload(all_clients).build()

            expect(reducer(previousState, action)).toEqual({
                clients: all_clients,
                status: "succeeded",
                error: null
            })
        })

        describe("Errors", () => {

            it("should handle errors from api", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withStructuredPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "an error message", type: "an error type"}]
                })
            })


            it("should handle errors in payload", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withErrorPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "error", type: "type"}]
                })
            })

            it("should handle errors with no payload", async () => {
                const previousState = new LoadingState().build()
                const action = new RejectedAction(fetchClients).withoutPayload().build()

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "An error occurred"}]
                })
            })
        })
    })
})