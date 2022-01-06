import {setupServer} from "msw/node";
import {compose, context, rest} from "msw";

type Request = {
    path: string
    method: string
    body: any
    status: number
    queryParam: any
    header: any
}

export class ServerBuilder {

    private requests: Request[] = []
    private runOnce: boolean = false

    request = (path: string, method: string, body: any, status: number = 200, queryParam: any = {}, header: any = {}): ServerBuilder => {
        this.requests.push({
            path: path,
            method: method,
            body: body,
            status: status,
            queryParam: queryParam,
            header: header
        })
        return this
    }

    once = (): ServerBuilder => {
        this.runOnce = true
        return this
    }

    build = () => {
        const getRequests = this.requests.filter(request => request.method === "get").map(request => rest.get(
            request.path, (req, res, ctx) => {
                for (const key in request.queryParam)
                    if (req.url.searchParams.get(key) === null) {
                        request.status = 404
                        request.body = {}
                    }

                const composeResponse = compose(
                    context.status(request.status),
                    context.json(request.body),
                    context.set(request.header)
                );
                return this.runOnce ? res.once(composeResponse) : res(composeResponse)
            }
        ))
        const postRequest = this.requests.filter(request => request.method === "post").map(request => rest.post(
            request.path, (req, res, ctx) => {
                return this.runOnce ?
                    res.once(ctx.status(request.status),
                        ctx.json(request.body)) :
                    res(
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

type BodyErrorDetail = {
    msg: string
    type: string
    loc: any[]
}

interface BodyErrorDetails {
    detail: BodyErrorDetail[]
}

export class APIErrorBody {

    private body: BodyErrorDetails = new class implements BodyErrorDetails {
        detail: Array<BodyErrorDetail> = [];
    }

    dummyDetail = () => {
        this.body.detail.push(APIDetail())
        return this
    }

    withDetail = (detail: BodyErrorDetail) => {
        this.body.detail.push(detail)
        return this
    }

    build = () => this.body
}

export const APIDetail = (msg = "an error message", type = "an error type", loc = []): BodyErrorDetail => ({
    loc: loc,
    msg: msg,
    type: type
})