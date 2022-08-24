import {render} from "../../../test-utils/test-utils";

import {screen, waitFor} from '@testing-library/react';
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import {afterAll, afterEach, beforeEach, describe, it} from "vitest"
import Login from "../Login";
import Home from "../../home";
import React from "react";
import userEvent from "@testing-library/user-event";
import {RequestHandlerBuilders, ServerBuilder} from "../../../test-utils/server/server";
import sign from "jwt-encode";
import {add} from "date-fns";

describe('Login', () => {

    const token = sign({exp: add(new Date(), {minutes: 2}).getTime()}, 'secret');

    const server = new ServerBuilder().serve(new RequestHandlerBuilders()
        .post("/token")
        .searchParams({username: "John", password: "password"})
        .created()
        .body({token: token, type: "bearer"})
        .build())

    beforeEach(() => server.listen())

    afterEach(() => server.resetHandlers())

    afterAll(() => server.close())

    it("should log user", async () => {
        render(
            <BrowserRouter>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route exact path="/" element={<Home/>}/>
                </Routes>
            </BrowserRouter>
        )
        await userEvent.click(screen.getByRole("link", {name: /login/i}))

        userEvent.type(screen.getByRole("textbox", {name: /username/i}), "John")
        userEvent.type(screen.getByLabelText(/password/i), "password")
        userEvent.click(screen.getByRole("button"))

        await waitFor(() => expect(screen.getByText("Welcome Home")).toBeInTheDocument())
    })

    it('should aware user in case of wrong login', async () => {
        server.resetHandlers(new RequestHandlerBuilders()
            .post("/token")
            .searchParams({username: "wronglogin", password: "wrongpassword"})
            .unauthorized()
            .body({"detail": [{msg: "Incorrect username or password", type: "Authentication"}]})
            .build())
        render(
            <BrowserRouter>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route exact path="/" element={<Home/>}/>
                </Routes>
            </BrowserRouter>
        )
        await userEvent.click(screen.getByRole("link", {name: /login/i}))

        userEvent.type(screen.getByRole("textbox", {name: /username/i}), "wronglogin")
        userEvent.type(screen.getByLabelText(/password/i), "wrongpassword")
        userEvent.click(screen.getByRole("button"))

        await waitFor(() => expect(screen.getByText("Incorrect username or password")).toBeInTheDocument())
    })
})