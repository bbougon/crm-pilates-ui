import reducer, {fetchClients} from "../clientsSlice";

describe('ClientsSlice', () => {

    describe("Fetching clients", () => {
        it('it should override previous state with fetched clients', async () => {
            const previousState = {
                clients: [
                    {
                        firstname: "John",
                        lastname: "Doe",
                        id: "33da6f12-efda-4c16-b8af-e5e822fc5459",
                    }
                ],
                status: "loading",
                error: null
            }
            let all_clients = [
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
            ];
            const action = {type: fetchClients.fulfilled.type, payload: all_clients};

            expect(reducer(previousState, action)).toEqual({
                clients: all_clients,
                status: "succeeded",
                error: null
            })
        })

        describe("Errors", () => {

            it("should handle errors from api", async () => {
                const previousState = {
                    clients: [],
                    status: "loading",
                    error: null
                }
                const action = {
                    type: fetchClients.rejected.type,
                    payload: {
                        detail: [
                            {
                                loc: [
                                    "a location"
                                ],
                                msg: "an error message",
                                type: "an error type"
                            }
                        ]
                    }
                };

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "an error message", type: "an error type"}]
                })
            })


            it("should handle errors in payload", async () => {
                const previousState = {
                    clients: [],
                    status: "loading",
                    error: null
                }
                const action = {
                    type: fetchClients.rejected.type,
                    payload: "error"
                };

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "error"}]
                })
            })

            it("should handle errors with no payload", async () => {
                const previousState = {
                    clients: [],
                    status: "loading",
                    error: null
                }
                const action = {
                    type: fetchClients.rejected.type
                };

                expect(reducer(previousState, action)).toEqual({
                    clients: [],
                    status: "failed",
                    error: [{message: "An error occurred"}]
                })
            })
        })
    })
})