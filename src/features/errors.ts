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
    }


let map_action_thunk_error = (payload: ApiError): ErrorMessage[] => {
    if (payload?.detail) {
        return payload.detail.map(detail => {
            return {message: detail.msg, type: detail.type}
        })
    }
    return [{message: "We could not fetch the request"}]
}

export default map_action_thunk_error