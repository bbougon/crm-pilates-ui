import {ClientCreation, ClientCredits} from "../features/clientsSlice";
import {Cancel, Checkin, Checkout} from "../features/sessionsSlice";
import {API_URI} from "../utils/constants.js";

type RequestConfig = {
    body?: unknown
    customConfig : {
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
        },
        mode: 'cors'
    }

    if (requestConfig.body) {
        config.body = JSON.stringify(requestConfig.body)
    }

    let data
    try {
        const request = new Request(API_URI + endpoint, config);
        const response = await fetch(request)
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
    } catch (err: Record<string, unknown> | unknown) {
        console.log(err)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Promise.reject(err.message ? err.message : data)
    }
}

api.createClient = (body: ClientCreation) => {
    return api("/clients", {customConfig: {}, body})
}

api.fetchClients = () => {
    return api("/clients", {customConfig: {method: 'GET'}})
}

api.addCredits = (clientCredits: ClientCredits) => {
    const body = [{
        subject: clientCredits.subject,
        value: clientCredits.creditsAmount
    }]
    const customConfig = {};
    return api(`/clients/${clientCredits.clientId}/credits`, {customConfig, body})
}

api.fetchSessions = (link: string) => {
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

api.sessionCheckout = (checkout: Checkout) => {
    const customConfig = {}
    const body = {
        attendee: checkout.attendeeId
    };
    return api(`/sessions/${checkout.sessionId}/checkout`, {customConfig, body})
}

api.addClassroom = (body: ApiClassroom) => {
    return api("/classrooms", {customConfig: {}, body})
}

api.sessionCancel = (cancel: Cancel) => {
    const customConfig = {}
    const body = {
        classroom_id: cancel.classroomId,
        session_date: cancel.start
    };
    return api(`/sessions/cancellation/${cancel.attendeeId}`, {customConfig, body})
}

export interface ApiClient {
    "id": string
    "firstname": string
    "lastname": string
    "credits": {
        "value": number
        "subject": string
    }[] | []
}

export interface ApiClassroom {
    id?: string
    name: string,
    position: number,
    subject: string,
    start_date: string,
    stop_date: string | null,
    duration: {
        duration: number,
        unit: "MINUTE"
    },
    attendees: { id: string }[]
}

export interface ApiCredits {
    amount: number
}

export interface ApiAttendee {
    id: string;
    firstname: string;
    lastname: string;
    attendance: string;
    credits?: ApiCredits
}

export interface ApiSession {
    id?: string
    name: string
    classroom_id: string
    position: number
    subject: string
    schedule: {
        start: string
        stop: string
    }
    attendees?: [ApiAttendee]
}
