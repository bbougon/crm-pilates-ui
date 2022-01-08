import {ApiClient} from "../../api";
import {Client, Credits} from "../../features/domain/client";

export class ClientsBuilder {
    private clients: any[] = []

    public withClient = (client: Client | ApiClient) => {
        this.clients.push(client)
        return this
    }

    public build = () => {
        return this.clients
    }
}

export const apiClient = (firstname = "John", lastname = "Doe", id = "33da6f12-efda-4c16-b8af-e5e822fc5459", credits: [{value: number, subject: string}]  | undefined= undefined): ApiClient => {
    return {
        firstname: firstname,
        lastname: lastname,
        id: id,
        credits: credits
    }
}

export const client = (firstname = "John", lastname = "Doe", id = "33da6f12-efda-4c16-b8af-e5e822fc5459", credits: Credits[]  | undefined= undefined): Client => {
    return {
        id: id,
        firstname: firstname,
        lastname: lastname,
        credits: credits
    }
}