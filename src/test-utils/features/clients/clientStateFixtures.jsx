export function LoadingState() {

    this.state = {
        clients: [],
        status: "loading",
        error: null
    }

    this.withClient = (client) => {
        this.state.clients.push(client)
        return this
    }
    this.build = () => {
        return this.state
    }

}

