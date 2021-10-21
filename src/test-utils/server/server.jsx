import {setupServer} from "msw/node";
import {rest} from "msw";

export function ServerBuilder() {
    this.requests = []

    this.request = (path, method, body, status = 200) => {
        this.requests.push({path: path, method: method, body: body, status: status})
        return this
    }

    this.build = () => {
        const getRequests = this.requests.filter(request => request.method === "get").map(request => rest.get(
            request.path, (req, res, ctx) => {
                return res(
                    ctx.status(request.status),
                    ctx.json(request.body)
                )
            }
        ))
        const postRequest = this.requests.filter(request => request.method === "post").map(request => rest.post(
            request.path, (req, res, ctx) => {
                return res(
                    ctx.status(request.status),
                    ctx.json(request.body)
                )
            }
        ))
        return setupServer(
            ...getRequests.concat(postRequest)
        )
    }
}

export function APIErrorBody(){
    this.body = {
        detail: []
    }

    this.dummyDetail = () => {
        this.body.detail.push(APIDetail())
        return this
    }

    this.withDetail = (detail) => {
        this.body.detail.push(detail)
        return this
    }

    this.build = () => this.body
}

export const APIDetail = (msg = "an error message", type = "an error type", loc = []) => ({loc: loc, msg: msg, type: type})