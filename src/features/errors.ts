export type ApiError = {
    detail: [
        {
            msg: string
            type: string
        }
    ]
}

export type ErrorMessage =
    {
        message: string
        type?: string
        origin: string
    }


const map_action_thunk_error = (request: string, payload: ApiError): ErrorMessage[] => {
    if (payload?.detail) {
        return payload.detail.map(detail => {
            return {message: detail.msg, type: detail.type, origin: request}
        })
    }
    return [{message: "We could not fetch the request", origin: request}]
}

export default map_action_thunk_error