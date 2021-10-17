import {setupServer} from "msw/node";
import {rest} from "msw";

export function ServerBuilder(path, httpVerb="get") {
    this.body = undefined
    this.status = 200
    this.path = path
    this.httpVerb = httpVerb

    this.withBody = (body) => {
        this.body = body
        return this
    }

    this.withStatus = (status) => {
        this.status = status
        return this
    }

    this.build = () => {
        return setupServer(
            rest.get(this.path, (req, res, ctx) => {
                return res(
                    ctx.status(this.status),
                    ctx.json(this.body)
                )
            }),
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