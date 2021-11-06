import {setupServer} from "msw/node";
import {compose, context, rest} from "msw";

export function ServerBuilder() {
    this.requests = []

    this.request = (path, method, body, status = 200, queryParam = {}, header = {}) => {
        this.requests.push({path: path, method: method, body: body, status: status, queryParam: queryParam, header: header})
        return this
    }

    this.build = () => {
        const getRequests = this.requests.filter(request => request.method === "get").map(request => rest.get(
            request.path, (req, res, ctx) => {
                for (const key in request.queryParam)
                    if(req.url.searchParams.get(key) === null) {
                        request.status = 404
                        request.body = {}
                    }

                return res.once(compose(
                    context.status(request.status),
                    context.json(request.body),
                    context.set(request.header)
                ))
            }
        ))
        const postRequest = this.requests.filter(request => request.method === "post").map(request => rest.post(
            request.path, (req, res, ctx) => {
                return res.once(
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