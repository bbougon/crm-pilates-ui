export function ClientsBuilder() {
    this.clients = []

    this.withClient = (client) => {
        this.clients.push(client)
        return this
    }

    this.build = () => {
        return this.clients
    }
}

export const client = (firstname = "John", lastname = "Doe", id = "33da6f12-efda-4c16-b8af-e5e822fc5459") => {
    return {
        firstname: firstname,
        lastname: lastname,
        id: id
    }
}