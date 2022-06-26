import "@testing-library/jest-dom"
import { Request, Response, fetch } from "cross-fetch";

vi.stubGlobal("Response", Response);
vi.stubGlobal("Request", Request);
vi.stubGlobal("fetch", fetch);