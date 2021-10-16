export const map_action_thunk_error = (action) => {
    if (action.hasOwnProperty("payload")) {
        const payload = action.payload
        if (payload.hasOwnProperty("detail")) {
            return payload.detail.map(detail => {
                return {message: detail.msg, type: detail.type}
            })
        }
        return [{message: payload}]
    }
    return [{message: "An error occurred"}]
}