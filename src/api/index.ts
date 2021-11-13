import {ClientCreation} from "../features/clientsSlice";
import {Checkin} from "../features/sessionsSlice";

type RequestConfig = {
    body?: {}
    customConfig : {
        headers?: any
        method?: string
    }
}

export async function api(endpoint: string, requestConfig: RequestConfig = {body: {}, customConfig: {}}) {
    const headers = { 'Content-Type': 'application/json' }

    const config: RequestInit = {
        method: requestConfig.body ? 'POST' : 'GET',
        ...requestConfig.customConfig,
        headers: {
            ...headers,
            ...requestConfig.customConfig.headers,
        },
        mode: 'cors'
    }

    if (requestConfig.body) {
        config.body = JSON.stringify(requestConfig.body)
    }

    let data
    try {
        const response = await fetch(process.env.REACT_APP_API_URI + endpoint, config)
        data = await response.json()
        if (response.ok) {
            return {
                status: response.status,
                data,
                headers: response.headers,
                url: response.url,
            }
        }
        throw new Error()
    } catch (err: any) {
        return Promise.reject(err.message ? err.message : data)
    }
}

api.createClient = (body: ClientCreation) => {
    return api("/clients", {customConfig: {}, body})
}

api.fetchClients = () => {
    return api("/clients", {customConfig: {method: 'GET'}})
}

api.fetchSessions = (link: any) => {
    return api(link, {customConfig: {method: 'GET'}})
}

api.sessionCheckin = (checkin: Checkin) => {
    const customConfig = {}
    const body = {
        classroom_id: checkin.classroomId,
        session_date: checkin.start,
        attendee: checkin.attendeeId
    };
    return api("/sessions/checkin", {customConfig, body})
}

api.addClassroom = (body: ApiClassroom) => {
    return api("/classrooms", {customConfig: {}, body})
}

export interface ApiClassroom {
    id?: string
    name: string,
    position: number,
    start_date: string,
    stop_date: string | null,
    duration: {
        duration: number,
        unit: "MINUTE"
    },
    attendees: { id: string }[]
}

export interface ApiAttendee {
    id: string;
    firstname: string;
    lastname: string;
    attendance: string;
}

export interface ApiSession {
    id?: string
    name: string
    classroom_id: string
    position: number
    schedule: {
        start: string
        stop: string
    }
    attendees?: [ApiAttendee]
}