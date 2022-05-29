import {setupServer} from "msw/node";
import {compose, context, RequestHandler, rest} from "msw";
import {isDeepStrictEqual} from "util";

interface ValueHeaderBuilder {
    value: any | undefined
    build(): any
}

interface HeaderBuilder {
    _key: string
    _value: any
    value(builder: ValueHeaderBuilder): any
    build(): any
}

type Link = string

type Rel = string

abstract class XLinkValueHeaderBuilder implements ValueHeaderBuilder{
    value: { link: Link, rel: Rel }[] | undefined;

    build = (): any => {
        return this.value?.map(xlink => xlink.link.concat("; rel=").concat(xlink.rel)).join(", ")
    }

}

export class SessionXLinkValueHeaderBuilder extends XLinkValueHeaderBuilder {

    value: { link: Link, rel: Rel }[] | undefined;

    build = (): any => {
        return this.value?.map(xlink => xlink.link.concat("; rel=").concat(xlink.rel)).join(", ")
    }

    current = (currentMonth: Date): SessionXLinkValueHeaderBuilder => {
        const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        this.value = [
            {link: `</sessions?month=${previousMonth}>`, rel: "previous"},
            {link: `</sessions?month=${currentMonth}>` as Link, rel: "current" as Rel},
            {link: `</sessions?month=${nextMonth}>`, rel: "next"}
            ]
        return this
    }
}

export class XLinkHeaderBuilder implements HeaderBuilder {
    _key: string = "X-Link"
    _value: any;

    build = (): any => {
        return {
            [this._key]: this._value
        }
    }

    value = (builder: ValueHeaderBuilder): XLinkHeaderBuilder => {
        this._value = builder.build()
        return this
    }
}

abstract class RequestHandlerBuilder {
    protected path: string
    protected statusCode: number = 200
    protected _body: any
    protected _header: any
    protected _runOnce: boolean = false
    protected _request: any

    constructor(path: string) {
        this.path = path
    }

    ok = (): RequestHandlerBuilder => {
        this.statusCode = 200
        return this
    }

    created = (): RequestHandlerBuilder => {
        this.statusCode = 201
        return this
    }

    unprocessableEntity = (): RequestHandlerBuilder => {
        this.statusCode = 422
        return this
    }

    request = (request: any): RequestHandlerBuilder => {
        this._request = request
        return this
    }

    body = (body: any): RequestHandlerBuilder => {
        this._body = body
        return this
    }

    header = <T extends HeaderBuilder>(header: T): RequestHandlerBuilder => {
        this._header = header.build()
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
        return rest.get(this.path, (req, res, _) => {
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
        return rest.post(this.path, (req, res, _) => {
            let composeResponse
            if (this._request
                && !isDeepStrictEqual(req.body, this._request)
                && ![400, 401, 402, 404, 422].includes(this.statusCode)) {
                composeResponse = compose(
                    context.status(400),
                    context.json( new APIErrorBody().dummyDetail().build())
                )
            } else {
                composeResponse = compose(
                    context.status(this.statusCode),
                    context.json(this._body)
                );
            }
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

export class ServerBuilder {

    serve = (...resolver: RequestHandler[]) => {
        return setupServer(...resolver)
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