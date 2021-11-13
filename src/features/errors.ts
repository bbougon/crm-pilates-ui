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
    if (payload) {
        return payload.detail?.map(detail => {
            return {message: detail.msg, type: detail.type}
        })
    }
    return [{message: "An error occurred"}]
}

export default map_action_thunk_error