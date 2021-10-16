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
        detail: [
            {
                loc: [],
                msg: undefined,
                type: undefined
            }
        ]
    }

    this.dummyMessage = () => {
        this.body.detail[0].msg = "an error message"
        return this
    }

    this.dummyType = () => {
        this.body.detail[0].type = "an error type"
        return this
    }

    this.build = () => this.body
}