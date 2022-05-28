import {setupServer} from "msw/node";
import {compose, context, RequestHandler, rest} from "msw";
import {isDeepStrictEqual} from "util";

type Request = {
    path: string
    method: string
    body: any
    status: number
    queryParam: any
    header: any
    responseBody: any
}

abstract class RequestHandlerBuilder {
    protected path: string
    protected statusCode: number = 200
    protected _body: any
    protected _header: any
    protected _runOnce: boolean = false

    constructor(path: string) {
        this.path = path
    }

    ok = (): RequestHandlerBuilder => {
        this.statusCode = 200
        return this
    }

    unprocessableEntity = (): RequestHandlerBuilder => {
        this.statusCode = 422
        return this
    }

    body = (body: any): RequestHandlerBuilder => {
        this._body = body
        return this
    }

    header = (header: any): RequestHandlerBuilder => {
        this._header = header
        return this
    }

    once = (): RequestHandlerBuilder => {
        this._runOnce = true
        return this
    }

    abstract build() : RequestHandler
}

export class GetRequestHandlerBuilder extends RequestHandlerBuilder{

    build(): RequestHandler {
        return rest.get(this.path, (req, res, ctx) => {
            let composedResponse;
            if (this._header) {
                composedResponse = compose(
                    context.status(this.statusCode),
                    context.json(this._body),
                    context.set(this._header)
                );
            } else {
                composedResponse = compose(
                    context.status(this.statusCode),
                    context.json(this._body)
                );
            }
            return this._runOnce ? res.once(composedResponse) :  res(composedResponse)
        });
    }

}

class PostRequestBuilderHandler extends RequestHandlerBuilder{

    build(): RequestHandler {
        return rest.post(this.path, (req, res, ctx) => {
            let composeResponse = compose(
                context.status(this.statusCode),
                context.json(this._body)
            );
            return res(composeResponse)
        });
    }
}

export class RequestHandlerBuilders {


    get = (path: string): GetRequestHandlerBuilder => {
        return new GetRequestHandlerBuilder(path)
    }

    post= (path: string): PostRequestBuilderHandler =>  {
        return new PostRequestBuilderHandler(path);
    }
}

export class ServerBuilder2 {

    serve = (...resolver: RequestHandler[]) => {
        return setupServer(...resolver)
    }
}

export class ServerBuilder {

    private requests: Request[] = []
    private runOnce: boolean = false

    request = (path: string, method: string, body: any, status: number = 200, queryParam: any = {}, header: any = {}, responseBody: any = body): ServerBuilder => {
        this.requests.push({
            path: path,
            method: method,
            body: body,
            status: status,
            queryParam: queryParam,
            header: header,
            responseBody: responseBody
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
                if (!isDeepStrictEqual(req.body, request.body)
                    && ![400, 401, 402, 404, 422].includes(request.status)) {
                    request.status = 400
                    request.body = new APIErrorBody().dummyDetail().build()
                }
                return this.runOnce ?
                    res.once(ctx.status(request.status),
                        ctx.json(request.responseBody)) :
                    res(
                        ctx.status(request.status),
                        ctx.json(request.responseBody)
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
    }()

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