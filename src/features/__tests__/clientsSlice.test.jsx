import reducer, {fetchClients} from "../clientsSlice";

describe('ClientsSlice', () => {

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
})