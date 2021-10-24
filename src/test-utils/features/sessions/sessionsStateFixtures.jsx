export function LoadingState() {

    this.state = {
        sessions: [],
        status: "loading",
        error: null,
        link: null
    }

    this.build = () => {
        return this.state
    }

}

