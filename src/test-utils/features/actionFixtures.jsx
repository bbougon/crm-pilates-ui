export function RejectedAction(type) {

    this.action ={
        type: type.rejected.type,
        payload: null
    }

    this.withStructuredPayload = () => {
        this.action.payload = {
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
        return this
    }

    this.withErrorPayload = () => {
        this.action.payload = "error"
        return this
    }

    this.withoutPayload = () => {
        this.action = {
            type: this.action.type
        }
        return this
    }

    this.build = () => this.action
}

export function FulFilledAction(type) {
    this.action = {
        type: type.fulfilled.type,
        payload: {}
    }

    this.withPayload = (payload) => {
        this.action.payload = payload
        return this
    }

    this.build = () => this.action
}