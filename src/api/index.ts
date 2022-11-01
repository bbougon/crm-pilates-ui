import { API_URI } from "../utils/constants.js";
import { Login } from "../features/auth";

type Request = {
  customConfig: {
    body?: null | undefined | string | URLSearchParams;
    method: string | "GET" | "POST";
    headers: {
      "Content-type"?: string;
      "Content-Type"?: string;
      Authorization?: string;
    };
  };
};

export const api = async (
  endpoint: string,
  request: Request = {
    customConfig: {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  }
) => {
  const config: RequestInit = {
    ...request.customConfig,
    mode: "cors",
  };

  let data;
  try {
    const response = await fetch(API_URI + endpoint, config);
    data = await response.json();
    if (response.ok) {
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    throw new Error();
  } catch (err: Record<string, unknown> | unknown) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Promise.reject(err.message ? err.message : data);
  }
};

api.login = (login: Login) => {
  const loginParams = new URLSearchParams();
  loginParams.append("username", login.username);
  loginParams.append("password", login.password);
  const customConfig = {
    body: loginParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  };
  return api(`/token`, { customConfig });
};

export default api;

export interface ApiClient {
  id: string;
  firstname: string;
  lastname: string;
  credits:
    | {
        value: number;
        subject: string;
      }[]
    | [];
}

export interface ApiClassroom {
  id?: string;
  name: string;
  position: number;
  subject: string;
  start_date: string;
  stop_date: string | null;
  duration: {
    duration: number;
    unit: "MINUTE";
  };
  attendees: { id: string }[];
}

export interface ApiCredits {
  amount: number;
}

export interface ApiAttendee {
  id: string;
  firstname: string;
  lastname: string;
  attendance: string;
  credits?: ApiCredits;
}

export interface ApiSession {
  id?: string;
  name: string;
  classroom_id: string;
  position: number;
  subject: string;
  schedule: {
    start: string;
    stop: string;
  };
  attendees?: [ApiAttendee];
}

export class ApiToken {}
