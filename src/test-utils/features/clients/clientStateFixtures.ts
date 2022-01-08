import {ClientState, ClientStatus} from "../../../features/clientsSlice";
import {Client} from "../../../features/domain/client";

export class LoadingState {

    private state: ClientState = {
        clients: [],
        status: ClientStatus.LOADING,
        error: []
    }

    withClient = (client: Client) => {
        this.state.clients.push(client)
        return this
    }

    build = () => {
        return this.state
    }

}
